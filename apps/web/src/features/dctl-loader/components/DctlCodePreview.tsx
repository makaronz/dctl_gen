import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { LoadedFile } from '../types/DctlFile';

interface DctlCodePreviewProps {
  selectedFile: LoadedFile | null;
  modifiedCode: string | null;
  showModified?: boolean;
  onToggleView?: () => void;
  onExport?: (code: string, filename: string) => void;
  onCopyToClipboard?: (code: string) => void;
}

export const DctlCodePreview: React.FC<DctlCodePreviewProps> = ({
  selectedFile,
  modifiedCode,
  showModified = false,
  onToggleView,
  onExport,
  onCopyToClipboard
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!selectedFile) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardContent className="p-6 text-center">
          <div className="text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">No file selected</p>
            <p className="text-xs text-gray-400 mt-1">Select a DCTL file to view its code</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayCode = showModified && modifiedCode ? modifiedCode : selectedFile.file.content;
  const hasModifications = modifiedCode && modifiedCode !== selectedFile.file.content;
  const filename = selectedFile.file.name;
  const modifiedFilename = filename.replace('.dctl', '_modified.dctl');

  const handleExport = async () => {
    if (!onExport) return;
    
    setIsExporting(true);
    try {
      const exportFilename = showModified ? modifiedFilename : filename;
      await onExport(displayCode, exportFilename);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!onCopyToClipboard) return;
    
    try {
      await onCopyToClipboard(displayCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-lg">
                Code Preview
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{filename}</span>
                {hasModifications && showModified && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Modified
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* View Toggle */}
              {hasModifications && onToggleView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleView}
                  className="text-xs"
                >
                  {showModified ? 'Show Original' : 'Show Modified'}
                </Button>
              )}
              
              {/* Copy Button */}
              {onCopyToClipboard && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                  className="text-xs"
                >
                  {copySuccess ? (
                    <>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                      Copy
                    </>
                  )}
                </Button>
              )}
              
              {/* Export Button */}
              {onExport && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="text-xs"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin w-3 h-3 mr-1 border border-white border-t-transparent rounded-full"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Export .dctl
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Code Display */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            {/* Code Content */}
            <pre className="overflow-auto max-h-96 p-4 bg-gray-50 text-sm font-mono leading-relaxed">
              <code>{displayCode}</code>
            </pre>
            
            {/* Line numbers overlay (optional) */}
            <div className="absolute top-0 left-0 p-4 pointer-events-none">
              <div className="text-gray-400 text-sm font-mono leading-relaxed select-none">
                {displayCode.split('\n').map((_, index) => (
                  <div key={index} className="text-right pr-2 min-w-[2rem]">
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {displayCode.split('\n').length}
              </div>
              <div className="text-xs text-gray-500">Lines</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {displayCode.length}
              </div>
              <div className="text-xs text-gray-500">Characters</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {selectedFile.file.parametersCount}
              </div>
              <div className="text-xs text-gray-500">Parameters</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(selectedFile.file.size / 1024 * 10) / 10}KB
              </div>
              <div className="text-xs text-gray-500">File Size</div>
            </div>
          </div>
          
          {/* Validation Status */}
          {selectedFile.validation.syntaxErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-1">Syntax Errors:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {selectedFile.validation.syntaxErrors.map((error, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span>•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {selectedFile.validation.warnings.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-1">Warnings:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {selectedFile.validation.warnings.slice(0, 3).map((warning, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span>•</span>
                    <span>{warning}</span>
                  </li>
                ))}
                {selectedFile.validation.warnings.length > 3 && (
                  <li className="text-yellow-600">
                    ... and {selectedFile.validation.warnings.length - 3} more warnings
                  </li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

 