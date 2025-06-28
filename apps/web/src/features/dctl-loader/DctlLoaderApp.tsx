import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { DctlFileUploader } from './components/DctlFileUploader';
import { DctlFileList } from './components/DctlFileList';
import { DctlParameterExtractor } from './components/DctlParameterExtractor';
import { DctlCodePreview } from './components/DctlCodePreview';
import { useDctlLoader } from './hooks/useDctlLoader';
import { useDctlParser } from './hooks/useDctlParser';
import { DctlFile } from './types/DctlFile';

export const DctlLoaderApp: React.FC = () => {
  const [showModifiedCode, setShowModifiedCode] = useState(false);
  
  // File management state
  const {
    loadedFiles,
    selectedFileId,
    status,
    error,
    loadFiles,
    selectFile,
    removeFile,
    clearAllFiles,
    getSelectedFile
  } = useDctlLoader();
  
  // Parameter parsing state
  const {
    parsedParameters,
    parameterGroups,
    parsingResult,
    isParsingState,
    parseError,
    modifiedCode,
    parseFile,
    updateParameter,
    resetParameter,
    resetAllParameters,
    generateModifiedCode,
    toggleParameterGroup
  } = useDctlParser();

  // Get currently selected file
  const selectedFile = getSelectedFile();

  // Parse file when selection changes
  React.useEffect(() => {
    if (selectedFile) {
      parseFile(selectedFile);
    }
  }, [selectedFile, parseFile]);

  // Export functionality
  const handleExport = async (code: string, filename: string) => {
    try {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Copy to clipboard functionality
  const handleCopyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      throw error;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-100 mb-1">
              DCTL Loader & Parameter Extractor
            </h1>
            <p className="text-sm text-gray-400">
              Load existing DCTL files and automatically generate UI controls for their parameters
            </p>
          </div>
          
          {/* Quick Stats */}
          {loadedFiles.length > 0 && (
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div>
                <span className="font-medium text-gray-300">{loadedFiles.length}</span> files loaded
              </div>
              {selectedFile && (
                <div>
                  <span className="font-medium text-gray-300">{selectedFile.file.parametersCount}</span> parameters found
                </div>
              )}
              {parsedParameters.length > 0 && (
                <div>
                  <span className="font-medium text-gray-300">{parsedParameters.filter(p => p.currentValue !== p.defaultValue).length}</span> modified
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-hidden flex">
        {/* Left Panel - File Management */}
        <div className="w-80 border-r border-gray-700 flex flex-col">
          <div className="p-4 space-y-4">
            <DctlFileUploader
              onFilesLoaded={loadFiles}
              isLoading={status === 'loading'}
              maxFiles={10}
            />
            
            <DctlFileList
              loadedFiles={loadedFiles}
              selectedFileId={selectedFileId}
              onSelectFile={selectFile}
              onRemoveFile={removeFile}
              onClearAll={clearAllFiles}
            />
          </div>
        </div>

        {/* Middle Panel - Parameter Controls */}
        <div className="flex-1 p-4 overflow-auto">
          {selectedFile ? (
            <div className="space-y-4">
              {/* Error Display */}
              {(error || parseError) && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="text-red-700 text-sm">
                      <strong>Error:</strong> {error || parseError}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Parsing Results */}
              {parsingResult && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800">
                      Parsing Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm text-blue-700">
                      Found {parsingResult.totalFound} parameters
                      {parsingResult.parseErrors.length > 0 && (
                        <span className="text-red-600 ml-2">
                          ({parsingResult.parseErrors.length} errors)
                        </span>
                      )}
                      {parsingResult.warnings.length > 0 && (
                        <span className="text-yellow-600 ml-2">
                          ({parsingResult.warnings.length} warnings)
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Parameter Controls */}
              <DctlParameterExtractor
                parameterGroups={parameterGroups}
                onParameterUpdate={updateParameter}
                onParameterReset={resetParameter}
                onResetAll={resetAllParameters}
                onToggleGroup={toggleParameterGroup}
                isLoading={isParsingState}
              />
            </div>
          ) : (
            <Card className="border-dashed border-gray-300 h-full">
              <CardContent className="p-8 text-center h-full flex items-center justify-center">
                <div className="text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">No file selected</h3>
                  <p className="text-sm text-gray-400 max-w-md mx-auto">
                    Upload or select a DCTL file from the left panel to automatically extract and control its parameters.
                  </p>
                  <div className="mt-4 text-xs text-gray-400">
                    💡 Try loading example files from resolve-dctl-master to get started
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Code Preview */}
        <div className="w-1/2 border-l border-gray-700 p-4">
          <DctlCodePreview
            selectedFile={selectedFile}
            modifiedCode={modifiedCode}
            showModified={showModifiedCode}
            onToggleView={() => setShowModifiedCode(!showModifiedCode)}
            onExport={handleExport}
            onCopyToClipboard={handleCopyToClipboard}
          />
        </div>
      </div>

      {/* Footer Status */}
      <div className="flex-shrink-0 h-8 flex items-center justify-between px-4 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full ${
              status === 'loaded' ? 'bg-green-500' : 
              status === 'loading' ? 'bg-yellow-500' : 
              'bg-red-500'
            }`} />
          <span className="capitalize">{status}</span>
        </div>
        {selectedFile && (
          <>
            <span>File: {selectedFile.file.name}</span>
            <span>Size: {Math.round(selectedFile.file.size / 1024)}KB</span>
            <span>Parameters: {selectedFile.file.parametersCount}</span>
          </>
        )}
      </div>
    </div>
  );
}; 