import React, { useState } from 'react';
import { X, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DataType } from '../data-type-selection';


export interface TaskItem {
  id: string;
  data: string;
  file?: {
    file_url: string;
    file_name: string;
    file_size_bytes: number;
    file_type: string;
  };
}

interface TaskItemProps {
  task: TaskItem;
  dataType: DataType;
  onUpdate: (task: TaskItem) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  dataType, 
  onUpdate, 
  onRemove, 
  canRemove 
}) => {
  const [data, setData] = useState(task.data);
  const [file, setFile] = useState<File | null>(null);

  const handleDataChange = (newData: string) => {
    setData(newData);
    onUpdate({ ...task, data: newData });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // TODO:Create file object for API format
      const fileData = {
        file_url: URL.createObjectURL(selectedFile), 
        file_name: selectedFile.name,
        file_size_bytes: selectedFile.size,
        file_type: selectedFile.type.split('/')[1] || selectedFile.name.split('.').pop() || ''
      };
      onUpdate({ ...task, file: fileData, data: selectedFile.name });
    }
  };

  const renderInput = () => {
    switch (dataType) {
      case 'TEXT':
        return (
          <Textarea
            placeholder="Enter the text content to be labeled..."
            value={data}
            onChange={(e) => handleDataChange(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        );
      
      case 'IMAGE':
      case 'VIDEO':
      case 'PDF':
        return (
          <div className="space-y-3">
            <input
              type="file"
              accept={
                dataType === 'IMAGE' ? 'image/*' :
                dataType === 'VIDEO' ? 'video/*' :
                '.pdf'
              }
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground
                        file:mr-4 file:py-2 file:px-4
                        file:rounded file:border-0
                        file:text-sm file:font-medium
                        file:bg-primary file:text-primary-foreground
                        hover:file:bg-primary/90"
            />
            {file && (
              <div className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        );
      
      case 'CSV':
        return (
          <div className="space-y-3">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground
                        file:mr-4 file:py-2 file:px-4
                        file:rounded file:border-0
                        file:text-sm file:font-medium
                        file:bg-primary file:text-primary-foreground
                        hover:file:bg-primary/90"
            />
            <Input
              placeholder="Or enter CSV data description..."
              value={data}
              onChange={(e) => handleDataChange(e.target.value)}
            />
            {file && (
              <div className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <Input
            placeholder="Enter task data..."
            value={data}
            onChange={(e) => handleDataChange(e.target.value)}
          />
        );
    }
  };

  return (
    <Card className="shadow-soft bg-card/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            Task Item
          </CardTitle>
          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {dataType === 'TEXT' ? 'Text Content' : 
             dataType === 'IMAGE' ? 'Image File' :
             dataType === 'VIDEO' ? 'Video File' :
             dataType === 'CSV' ? 'CSV File or Data' :
             'PDF File'} *
          </Label>
          {renderInput()}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskItem;