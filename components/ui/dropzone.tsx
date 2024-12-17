import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

export interface DropzoneProps {
  onFileAccepted: (file: File) => void;
  className?: string;
}

export function Dropzone({ onFileAccepted, className }: DropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileAccepted(acceptedFiles[0]);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/epub+zip': ['.epub']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer',
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
        className
      )}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the EPUB file here...</p>
      ) : (
        <p>Drag and drop an EPUB file here, or click to select a file</p>
      )}
    </div>
  );
}
