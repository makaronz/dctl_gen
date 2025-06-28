import { useState, useCallback } from 'react';
import { DctlFile, LoadedFile, DctlFileStatus } from '../types/DctlFile';
import { DctlFileService } from '../services/DctlFileService';

interface UseDctlLoaderState {
  loadedFiles: LoadedFile[];
  selectedFileId: string | null;
  status: DctlFileStatus;
  error: string | null;
}

interface UseDctlLoaderActions {
  loadFiles: (files: DctlFile[]) => void;
  selectFile: (fileId: string) => void;
  removeFile: (fileId: string) => void;
  clearAllFiles: () => void;
  getSelectedFile: () => LoadedFile | null;
  getFileById: (fileId: string) => LoadedFile | null;
}

type UseDctlLoaderReturn = UseDctlLoaderState & UseDctlLoaderActions;

export const useDctlLoader = (): UseDctlLoaderReturn => {
  const [loadedFiles, setLoadedFiles] = useState<LoadedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [status, setStatus] = useState<DctlFileStatus>('loaded');
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback((files: DctlFile[]) => {
    setStatus('loading');
    setError(null);
    
    try {
      const newLoadedFiles = files.map(file => 
        DctlFileService.createLoadedFile(file)
      );
      
      setLoadedFiles(prev => {
        // Remove duplicates (same name)
        const existingNames = prev.map(f => f.file.name);
        const uniqueNewFiles = newLoadedFiles.filter(
          newFile => !existingNames.includes(newFile.file.name)
        );
        
        return [...prev, ...uniqueNewFiles];
      });
      
      // Auto-select first file if none selected
      if (!selectedFileId && newLoadedFiles.length > 0) {
        setSelectedFileId(newLoadedFiles[0].file.id);
      }
      
      setStatus('loaded');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error loading files');
      setStatus('error');
    }
  }, [selectedFileId]);

  const selectFile = useCallback((fileId: string) => {
    const file = loadedFiles.find(f => f.file.id === fileId);
    if (file) {
      // Update selection state
      setLoadedFiles(prev => 
        prev.map(f => ({
          ...f,
          isSelected: f.file.id === fileId
        }))
      );
      setSelectedFileId(fileId);
      setError(null);
    }
  }, [loadedFiles]);

  const removeFile = useCallback((fileId: string) => {
    setLoadedFiles(prev => {
      const updated = prev.filter(f => f.file.id !== fileId);
      
      // If removed file was selected, select another or clear selection
      if (selectedFileId === fileId) {
        const newSelected = updated.length > 0 ? updated[0].file.id : null;
        setSelectedFileId(newSelected);
        
        // Update selection state
        return updated.map(f => ({
          ...f,
          isSelected: f.file.id === newSelected
        }));
      }
      
      return updated;
    });
  }, [selectedFileId]);

  const clearAllFiles = useCallback(() => {
    setLoadedFiles([]);
    setSelectedFileId(null);
    setError(null);
    setStatus('loaded');
  }, []);

  const getSelectedFile = useCallback((): LoadedFile | null => {
    return loadedFiles.find(f => f.file.id === selectedFileId) || null;
  }, [loadedFiles, selectedFileId]);

  const getFileById = useCallback((fileId: string): LoadedFile | null => {
    return loadedFiles.find(f => f.file.id === fileId) || null;
  }, [loadedFiles]);

  return {
    // State
    loadedFiles,
    selectedFileId,
    status,
    error,
    
    // Actions
    loadFiles,
    selectFile,
    removeFile,
    clearAllFiles,
    getSelectedFile,
    getFileById
  };
}; 