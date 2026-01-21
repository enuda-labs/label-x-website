import React, { useState } from 'react'
import { X, GripVertical, Upload, Mic, Video as VideoIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataType } from '../data-type-selection'
import AudioRecording from './AudioRecording'
import VideoRecording from './VideoRecording'

export interface TaskItem {
  id: string
  data: string
  file: File | null
  recordedBlob?: Blob | null
  recordedUrl?: string | null
  recordingType?: 'audio' | 'video' | null
}

interface TaskItemProps {
  task: TaskItem
  dataType: DataType
  onUpdate: (task: TaskItem) => void
  onRemove: () => void
  canRemove: boolean
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  dataType,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  const [activeTab, setActiveTab] = useState<string>('file')
  const [data, setData] = useState(task.data)
  const [file, setFile] = useState<File | null>(task.file)

  const handleDataChange = (newData: string) => {
    setData(newData)
    onUpdate({ ...task, data: newData })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null
    setFile(selectedFile)
    onUpdate({
      ...task,
      file: selectedFile,
      data: selectedFile ? selectedFile.name : '',
      recordedBlob: null,
      recordedUrl: null,
      recordingType: null,
    })
  }

  const handleRecordingComplete = (
    blob: Blob,
    url: string,
    type: 'audio' | 'video'
  ) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const extension = type === 'audio' ? 'webm' : 'webm'
    const fileName = `${type}_record_${timestamp}.${extension}`

    onUpdate({
      ...task,
      data: fileName,
      recordedBlob: blob,
      recordedUrl: url,
      recordingType: type,
      file: null,
    })
    setFile(null)
  }

  const handleRecordingDiscard = () => {
    onUpdate({
      ...task,
      data: '',
      recordedBlob: null,
      recordedUrl: null,
      recordingType: null,
    })
  }

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
        )

      case 'AUDIO':
      case 'VIDEO':
        return (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="my-5 grid w-full grid-cols-3">
              <TabsTrigger value="file" className="flex items-center gap-2">
                <Upload className="h-4 w-4" /> Upload
              </TabsTrigger>
              {dataType === 'AUDIO' && (
                <TabsTrigger value="audio" className="flex items-center gap-2">
                  <Mic className="h-4 w-4" /> Record Audio
                </TabsTrigger>
              )}
              {dataType === 'VIDEO' && (
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <VideoIcon className="h-4 w-4" /> Record Video
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="file" className="space-y-3">
              <input
                type="file"
                accept={dataType === 'AUDIO' ? 'audio/*' : 'video/*'}
                onChange={handleFileChange}
                className="text-muted-foreground file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 block w-full text-sm file:mr-4 file:rounded file:border-0 file:px-4 file:py-2 file:text-sm file:font-medium"
              />
              {file && (
                <div className="text-muted-foreground text-sm">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </TabsContent>
            {dataType === 'AUDIO' && (
              <TabsContent value="audio" className="space-y-3">
                <AudioRecording
                  maxDurationSec={dataType === 'AUDIO' ? 60 : 30}
                  onRecordingComplete={(blob, url) =>
                    handleRecordingComplete(blob, url, 'audio')
                  }
                  onRecordingDiscard={handleRecordingDiscard}
                />
                {task.recordingType === 'audio' && task.recordedBlob && (
                  <div className="text-muted-foreground text-sm">
                    Audio recorded: {(task.recordedBlob.size / 1024).toFixed(1)}{' '}
                    KB
                  </div>
                )}
              </TabsContent>
            )}

            {dataType === 'VIDEO' && (
              <TabsContent value="video" className="space-y-3">
                <VideoRecording
                  maxDurationSec={30}
                  onRecordingComplete={(blob, url) =>
                    handleRecordingComplete(blob, url, 'video')
                  }
                  onRecordingDiscard={handleRecordingDiscard}
                />
                {task.recordingType === 'video' && task.recordedBlob && (
                  <div className="text-muted-foreground text-sm">
                    Video recorded: {(task.recordedBlob.size / 1024).toFixed(1)}{' '}
                    KB
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        )

      case 'IMAGE':
      case 'PDF':
        return (
          <div className="space-y-3">
            <input
              type="file"
              accept={dataType === 'IMAGE' ? 'image/*' : '.pdf'}
              onChange={handleFileChange}
              className="text-muted-foreground file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 block w-full text-sm file:mr-4 file:rounded file:border-0 file:px-4 file:py-2 file:text-sm file:font-medium"
            />
            {file && (
              <div className="text-muted-foreground text-sm">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        )

      case 'CSV':
        return (
          <div className="space-y-3">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="text-muted-foreground file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 block w-full text-sm file:mr-4 file:rounded file:border-0 file:px-4 file:py-2 file:text-sm file:font-medium"
            />
            <Input
              placeholder="Or enter CSV data description..."
              value={data}
              onChange={(e) => handleDataChange(e.target.value)}
            />
            {file && (
              <div className="text-muted-foreground text-sm">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        )

      default:
        return (
          <Input
            placeholder="Enter task data..."
            value={data}
            onChange={(e) => handleDataChange(e.target.value)}
          />
        )
    }
  }

  return (
    <Card className="shadow-soft bg-card/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <GripVertical className="text-muted-foreground h-4 w-4" />
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
            {dataType === 'TEXT'
              ? 'Text Content'
              : dataType === 'IMAGE'
                ? 'Image File'
                : dataType === 'VIDEO'
                  ? 'Video File / Recording'
                  : dataType === 'AUDIO'
                    ? 'Audio File / Recording'
                    : dataType === 'CSV'
                      ? 'CSV File or Data'
                      : 'PDF File'}{' '}
            *
          </Label>
          {renderInput()}
        </div>
      </CardContent>
    </Card>
  )
}

export default TaskItem
