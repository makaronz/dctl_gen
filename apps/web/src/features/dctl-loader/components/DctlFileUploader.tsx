import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { DctlFileService } from '../services/DctlFileService';
import { DctlFile } from '../types/DctlFile';

interface DctlFileUploaderProps {
  onFilesLoaded: (files: DctlFile[]) => void;
  isLoading?: boolean;
  maxFiles?: number;
}

export const DctlFileUploader: React.FC<DctlFileUploaderProps> = ({
  onFilesLoaded,
  isLoading = false,
  maxFiles = 10
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processingFiles, setProcessingFiles] = useState(false);

  const handleFiles = useCallback(async (files: FileList) => {
    setUploadError(null);
    setProcessingFiles(true);

    try {
      const fileArray = Array.from(files);
      
      // Limit number of files
      if (fileArray.length > maxFiles) {
        setUploadError(`Maximum ${maxFiles} files allowed at once`);
        setProcessingFiles(false);
        return;
      }

      // Process each file
      const dctlFiles: DctlFile[] = [];
      
      for (const file of fileArray) {
        try {
          const dctlFile = await DctlFileService.createDctlFile(file);
          dctlFiles.push(dctlFile);
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          // Continue processing other files
        }
      }

      if (dctlFiles.length === 0) {
        setUploadError('No valid DCTL files found');
      } else {
        onFilesLoaded(dctlFiles);
        
        // Show summary
        const validFiles = dctlFiles.filter(f => f.isValid).length;
        const invalidFiles = dctlFiles.length - validFiles;
        
        if (invalidFiles > 0) {
          setUploadError(`${validFiles} files loaded successfully, ${invalidFiles} files had errors`);
        }
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setProcessingFiles(false);
    }
  }, [onFilesLoaded, maxFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow re-uploading the same file
    e.target.value = '';
  }, [handleFiles]);

  const loadExampleFiles = useCallback(async () => {
    setProcessingFiles(true);
    setUploadError(null);

    try {
      // Load example files from resolve-dctl-master directory
      const exampleFiles = [
        'Blackout.dctl',
        'S-Curves.dctl', 
        'Channel-Saturation.dctl',
        'Clamp.dctl',
        'Luma-Limiter.dctl'
      ];

      const loadedFiles: DctlFile[] = [];

      for (const fileName of exampleFiles) {
        try {
          const response = await fetch(`/resolve-dctl-master/${fileName}`);
          if (response.ok) {
            const content = await response.text();
            const dctlFile: DctlFile = {
              id: DctlFileService.generateFileId(),
              name: fileName,
              size: content.length,
              content,
              uploadedAt: new Date(),
              isValid: true,
              parametersCount: DctlFileService.countParameters(content)
            };
            loadedFiles.push(dctlFile);
          }
        } catch (error) {
          console.warn(`Could not load example file: ${fileName}`, error);
        }
      }

      if (loadedFiles.length > 0) {
        onFilesLoaded(loadedFiles);
      } else {
        setUploadError('Could not load example files. Try uploading your own DCTL files.');
      }
    } catch (error) {
      setUploadError('Failed to load example files');
    } finally {
      setProcessingFiles(false);
    }
  }, [onFilesLoaded]);

  const isDisabled = isLoading || processingFiles;

  return (
    <div className="space-y-4">
      {/* Main Upload Area */}
      <Card 
        className={`transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50 border-2' 
            : 'border-gray-300 hover:border-gray-400'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 text-gray-400">
              {processingFiles ? (
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
              ) : (
                <svg
                  className="w-full h-full"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            {/* Text */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {processingFiles ? 'Processing files...' : 'Upload DCTL Files'}
              </h3>
              <p className="text-gray-600 mb-4">
                {isDragOver 
                  ? 'Drop your .dctl files here' 
                  : 'Drag & drop your .dctl files here, or click to browse'
                }
              </p>
              <p className="text-sm text-gray-500">
                Supports .dctl files up to 5MB each • Maximum {maxFiles} files
              </p>
            </div>

            {/* Browse Button */}
            <div className="space-y-2">
              <input
                type="file"
                accept=".dctl"
                multiple
                onChange={handleFileInput}
                disabled={isDisabled}
                className="hidden"
                id="dctl-file-input"
              />
              <label htmlFor="dctl-file-input">
                <Button 
                  variant="outline" 
                  className="cursor-pointer"
                  disabled={isDisabled}
                  asChild
                >
                  <span>
                    {processingFiles ? 'Processing...' : 'Browse Files'}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Load Examples Button */}
      <div>
        <Button
          variant="secondary"
          onClick={loadExampleFiles}
          disabled={isDisabled}
          className="w-full"
        >
          {processingFiles ? 'Loading...' : 'Load Example Files from resolve-dctl-master'}
        </Button>
      </div>

      {/* Error Display */}
      {uploadError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="text-red-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-800">Upload Error</h4>
                <p className="text-sm text-red-700 mt-1">{uploadError}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadError(null)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 