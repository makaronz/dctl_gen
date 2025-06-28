import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { LoadedFile } from '../types/DctlFile';

interface DctlFileListProps {
  loadedFiles: LoadedFile[];
  selectedFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onRemoveFile: (fileId: string) => void;
  onClearAll: () => void;
}

export const DctlFileList: React.FC<DctlFileListProps> = ({
  loadedFiles,
  selectedFileId,
  onSelectFile,
  onRemoveFile,
  onClearAll
}) => {
  if (loadedFiles.length === 0) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardContent className="p-6 text-center">
          <div className="text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">No DCTL files loaded</p>
            <p className="text-xs text-gray-400 mt-1">Upload files to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Loaded Files ({loadedFiles.length})
          </CardTitle>
          {loadedFiles.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {loadedFiles.map((loadedFile) => {
          const { file, validation } = loadedFile;
          const isSelected = file.id === selectedFileId;
          
          return (
            <div
              key={file.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onSelectFile(file.id)}
            >
              <div className="flex items-center justify-between">
                {/* File Info */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {validation.isValid ? (
                      <div className="w-3 h-3 bg-green-500 rounded-full" title="Valid DCTL file" />
                    ) : (
                      <div className="w-3 h-3 bg-red-500 rounded-full" title="Invalid DCTL file" />
                    )}
                  </div>
                  
                  {/* File Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </h4>
                      {isSelected && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Selected
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{file.parametersCount} parameters</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                    </div>
                    
                    {/* Error message */}
                    {file.errorMessage && (
                      <p className="text-xs text-red-600 mt-1 truncate">
                        {file.errorMessage}
                      </p>
                    )}
                    
                    {/* Validation warnings */}
                    {validation.warnings.length > 0 && (
                      <p className="text-xs text-yellow-600 mt-1 truncate">
                        {validation.warnings[0]}
                        {validation.warnings.length > 1 && ` (+${validation.warnings.length - 1} more)`}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {/* Parameter Count Badge */}
                  {file.parametersCount > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {file.parametersCount}
                    </span>
                  )}
                  
                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(file.id);
                    }}
                    className="text-gray-400 hover:text-red-600 p-1 h-auto"
                    title="Remove file"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>
              </div>
              
              {/* Validation Details (for selected file) */}
              {isSelected && (validation.syntaxErrors.length > 0 || validation.warnings.length > 0) && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  {validation.syntaxErrors.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-red-700 mb-1">Errors:</p>
                      <ul className="text-xs text-red-600 space-y-1">
                        {validation.syntaxErrors.map((error, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span>•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {validation.warnings.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-yellow-700 mb-1">Warnings:</p>
                      <ul className="text-xs text-yellow-600 space-y-1">
                        {validation.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span>•</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}; 