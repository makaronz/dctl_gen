import { useState, useCallback, useEffect } from 'react';
import { DctlParserService } from '../services/DctlParserService';
import { 
  ParsedDctlParameter, 
  ParameterParsingResult, 
  ParameterGroup,
  ParameterCategory 
} from '../types/ParsedParameter';
import { LoadedFile } from '../types/DctlFile';

interface UseDctlParserState {
  parsedParameters: ParsedDctlParameter[];
  parameterGroups: ParameterGroup[];
  parsingResult: ParameterParsingResult | null;
  isParsingState: boolean;
  parseError: string | null;
  modifiedCode: string | null;
}

interface UseDctlParserActions {
  parseFile: (loadedFile: LoadedFile) => void;
  updateParameter: (parameterId: string, newValue: number | boolean | string) => void;
  resetParameter: (parameterId: string) => void;
  resetAllParameters: () => void;
  generateModifiedCode: () => string | null;
  getParameterById: (parameterId: string) => ParsedDctlParameter | null;
  getParametersByCategory: (category: ParameterCategory) => ParsedDctlParameter[];
  toggleParameterGroup: (category: ParameterCategory) => void;
}

type UseDctlParserReturn = UseDctlParserState & UseDctlParserActions;

export const useDctlParser = (): UseDctlParserReturn => {
  const [parsedParameters, setParsedParameters] = useState<ParsedDctlParameter[]>([]);
  const [parameterGroups, setParameterGroups] = useState<ParameterGroup[]>([]);
  const [parsingResult, setParsingResult] = useState<ParameterParsingResult | null>(null);
  const [isParsingState, setIsParsingState] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [modifiedCode, setModifiedCode] = useState<string | null>(null);
  const [originalContent, setOriginalContent] = useState<string>('');

  // Parse file content and extract parameters
  const parseFile = useCallback((loadedFile: LoadedFile) => {
    setIsParsingState(true);
    setParseError(null);
    
    try {
      const content = loadedFile.file.content;
      setOriginalContent(content);
      
      const result = DctlParserService.parseParameters(content);
      setParsingResult(result);
      setParsedParameters(result.parameters);
      
      // Group parameters by category
      const groups = createParameterGroups(result.parameters);
      setParameterGroups(groups);
      
      // Generate initial modified code
      setModifiedCode(content);
      
      if (result.parseErrors.length > 0) {
        setParseError(`Parsing errors: ${result.parseErrors.map(e => e.message).join('; ')}`);
      }
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Unknown parsing error');
      setParsingResult(null);
      setParsedParameters([]);
      setParameterGroups([]);
    } finally {
      setIsParsingState(false);
    }
  }, []);

  // Update a parameter value
  const updateParameter = useCallback((parameterId: string, newValue: number | boolean | string) => {
    setParsedParameters(prev => {
      const updatedParams = prev.map(param => 
        param.id === parameterId 
          ? { ...param, currentValue: newValue }
          : param
      );
      
      // Update parameter groups as well
      const updatedGroups = createParameterGroups(updatedParams);
      setParameterGroups(prevGroups => 
        updatedGroups.map(newGroup => ({
          ...newGroup,
          isExpanded: prevGroups.find(g => g.category === newGroup.category)?.isExpanded ?? true
        }))
      );
      
      return updatedParams;
    });
  }, []);

  // Reset parameter to default value
  const resetParameter = useCallback((parameterId: string) => {
    setParsedParameters(prev => {
      const updatedParams = prev.map(param => 
        param.id === parameterId 
          ? { ...param, currentValue: param.defaultValue }
          : param
      );
      
      // Update parameter groups as well
      const updatedGroups = createParameterGroups(updatedParams);
      setParameterGroups(prevGroups => 
        updatedGroups.map(newGroup => ({
          ...newGroup,
          isExpanded: prevGroups.find(g => g.category === newGroup.category)?.isExpanded ?? true
        }))
      );
      
      return updatedParams;
    });
  }, []);

  // Reset all parameters to default values
  const resetAllParameters = useCallback(() => {
    setParsedParameters(prev => {
      const updatedParams = prev.map(param => ({ 
        ...param, 
        currentValue: param.defaultValue 
      }));
      
      // Update parameter groups as well
      const updatedGroups = createParameterGroups(updatedParams);
      setParameterGroups(prevGroups => 
        updatedGroups.map(newGroup => ({
          ...newGroup,
          isExpanded: prevGroups.find(g => g.category === newGroup.category)?.isExpanded ?? true
        }))
      );
      
      return updatedParams;
    });
  }, []);

  // Generate modified DCTL code with current parameter values
  const generateModifiedCode = useCallback((): string | null => {
    if (!originalContent || parsedParameters.length === 0) {
      return originalContent || null;
    }

    let modifiedContent = originalContent;
    
    // Replace each DEFINE_UI_PARAMS with updated values
    parsedParameters.forEach(param => {
      const originalDef = param.originalDefinition;
      const updatedDef = generateUpdatedParameterDefinition(param);
      
      modifiedContent = modifiedContent.replace(originalDef, updatedDef);
    });
    
    setModifiedCode(modifiedContent);
    return modifiedContent;
  }, [originalContent, parsedParameters]);

  // Get parameter by ID
  const getParameterById = useCallback((parameterId: string): ParsedDctlParameter | null => {
    return parsedParameters.find(p => p.id === parameterId) || null;
  }, [parsedParameters]);

  // Get parameters by category
  const getParametersByCategory = useCallback((category: ParameterCategory): ParsedDctlParameter[] => {
    return parsedParameters.filter(p => p.category === category);
  }, [parsedParameters]);

  // Toggle parameter group expansion
  const toggleParameterGroup = useCallback((category: ParameterCategory) => {
    setParameterGroups(prev => 
      prev.map(group => 
        group.category === category 
          ? { ...group, isExpanded: !group.isExpanded }
          : group
      )
    );
  }, []);

  // Auto-regenerate modified code when parameters change
  useEffect(() => {
    if (parsedParameters.length > 0) {
      generateModifiedCode();
    }
  }, [parsedParameters, generateModifiedCode]);

  return {
    // State
    parsedParameters,
    parameterGroups,
    parsingResult,
    isParsingState,
    parseError,
    modifiedCode,
    
    // Actions
    parseFile,
    updateParameter,
    resetParameter,
    resetAllParameters,
    generateModifiedCode,
    getParameterById,
    getParametersByCategory,
    toggleParameterGroup
  };
};

// Helper function to create parameter groups
function createParameterGroups(parameters: ParsedDctlParameter[]): ParameterGroup[] {
  const categoryDisplayNames: Record<ParameterCategory, string> = {
    exposure: 'Exposure',
    color: 'Color',
    gamma: 'Gamma',
    contrast: 'Contrast',
    saturation: 'Saturation',
    effects: 'Effects',
    geometry: 'Geometry',
    curves: 'Curves',
    other: 'Other'
  };

  // Group parameters by category
  const groupedParams = parameters.reduce((acc, param) => {
    const category = param.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(param);
    return acc;
  }, {} as Record<ParameterCategory, ParsedDctlParameter[]>);

  // Convert to ParameterGroup array
  return Object.entries(groupedParams).map(([category, params]) => ({
    category: category as ParameterCategory,
    displayName: categoryDisplayNames[category as ParameterCategory],
    parameters: params,
    isExpanded: true // Start with all groups expanded
  }));
}

// Helper function to generate updated parameter definition
function generateUpdatedParameterDefinition(param: ParsedDctlParameter): string {
  const parts = [param.name, `"${param.displayName}"`, param.type, String(param.currentValue)];
  
  // Add type-specific parameters
  switch (param.type) {
    case 'DCTLUI_SLIDER_FLOAT':
    case 'DCTLUI_SLIDER_INT':
      if (param.min !== undefined && param.max !== undefined) {
        parts.push(String(param.min), String(param.max));
        
        if (param.step !== undefined && param.type === 'DCTLUI_SLIDER_FLOAT') {
          parts.push(String(param.step));
        }
      }
      break;
      
    case 'DCTLUI_COMBO_BOX':
      if (param.options && param.optionLabels) {
        const enumValues = `{${param.options.join(', ')}}`;
        const enumLabels = `{${param.optionLabels.join(', ')}}`;
        parts.push(enumValues, enumLabels);
      }
      break;
  }
  
  return `DEFINE_UI_PARAMS(${parts.join(', ')})`;
} 