import React, { useState, useCallback } from 'react';
import { Upload, X, File, FileText, Video, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedTypes = ['.csv', '.json', '.txt', '.jpg', '.jpeg', '.png', '.mp4', '.avi'],
  maxSizeMB = 50,
  className
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase();
    if (type.startsWith('image/')) return <ImageIcon className="h-6 w-6 text-primary" />;
    if (type.startsWith('video/')) return <Video className="h-6 w-6 text-primary" />;
    if (type.includes('json') || type.includes('csv')) return <FileText className="h-6 w-6 text-primary" />;
    return <File className="h-6 w-6 text-primary" />;
  };

  const validateFile = (file: File): string | null => {
    // This checks for the file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // This checks for the file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.some(type => extension === type.toLowerCase())) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("w-full", className)}>
      {!selectedFile ? (
        <Card
          className={cn(
            "relative border-2 border-dashed transition-all duration-200 cursor-pointer",
            dragActive 
              ? "border-primary bg-primary/5 shadow-soft" 
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
            error && "border-destructive bg-destructive/5"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <div className="p-8 text-center">
            <Upload className={cn(
              "mx-auto h-12 w-12 mb-4 transition-colors",
              dragActive ? "text-primary" : "text-muted-foreground"
            )} />
            <h3 className="text-lg font-semibold mb-2">
              {dragActive ? "Drop your file here" : "Upload your dataset"}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports: {acceptedTypes.join(', ')} • Max size: {maxSizeMB}MB
            </p>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept={acceptedTypes.join(',')}
              onChange={handleChange}
            />
          </div>
        </Card>
      ) : (
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile)}
              <div>
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
      
      {error && (
        <p className="text-sm text-destructive mt-2 font-medium">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;