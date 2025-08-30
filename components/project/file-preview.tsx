import React, { useState, useEffect } from 'react'
import { FileText, ImageIcon, Video, File, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface FilePreviewProps {
  file: File
  className?: string
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, className }) => {
  const [preview, setPreview] = useState<string | null>(null)
  const [csvData, setCsvData] = useState<string[][] | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [jsonData, setJsonData] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const generatePreview = async () => {
      try {
        setError('')

        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file)
          setPreview(url)
          return () => URL.revokeObjectURL(url)
        }

        if (file.type.startsWith('video/')) {
          const url = URL.createObjectURL(file)
          setPreview(url)
          return () => URL.revokeObjectURL(url)
        }

        // Handle text-based files
        if (file.type.includes('csv') || file.name.endsWith('.csv')) {
          const text = await file.text()
          const lines = text.split('\n').slice(0, 6) // Show first 6 rows
          const data = lines.map((line) =>
            line.split(',').map((cell) => cell.trim())
          )
          setCsvData(data)
        } else if (file.type.includes('json') || file.name.endsWith('.json')) {
          const text = await file.text()
          const data = JSON.parse(text)
          setJsonData(data)
        } else if (file.type.includes('text') || file.name.endsWith('.txt')) {
          const text = await file.text()
          setPreview(text.slice(0, 500)) // Show first 500 characters
        }
      } catch (err) {
        setError('Unable to preview this file')
        console.error('Preview error:', err)
      }
    }

    generatePreview()
  }, [file])

  const getFileIcon = () => {
    if (file.type.startsWith('image/'))
      return <ImageIcon className="text-primary h-5 w-5" />
    if (file.type.startsWith('video/'))
      return <Video className="text-primary h-5 w-5" />
    if (file.type.includes('json') || file.type.includes('csv'))
      return <FileText className="text-primary h-5 w-5" />
    return <File className="text-primary h-5 w-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderPreviewContent = () => {
    if (error) {
      return (
        <div className="text-muted-foreground flex flex-col items-center justify-center py-8">
          <Eye className="mb-2 h-12 w-12 opacity-50" />
          <p>{error}</p>
        </div>
      )
    }

    // Image preview
    if (file.type.startsWith('image/') && preview) {
      return (
        <div className="bg-muted aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={preview}
            alt="Preview"
            width={500}
            height={500}
            className="h-full w-full object-contain"
          />
        </div>
      )
    }

    // Video preview
    if (file.type.startsWith('video/') && preview) {
      return (
        <div className="bg-muted aspect-video w-full overflow-hidden rounded-lg">
          <video
            src={preview}
            controls
            className="h-full w-full object-contain"
          />
        </div>
      )
    }

    // CSV preview
    if (csvData) {
      return (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {csvData.map((row, i) => (
                  <tr
                    key={i}
                    className={
                      i === 0 ? 'bg-muted font-medium' : 'hover:bg-muted/50'
                    }
                  >
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="border-border border-r px-3 py-2 last:border-r-0"
                      >
                        {cell || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {csvData.length >= 6 && (
            <div className="bg-muted/50 text-muted-foreground border-t px-3 py-2 text-xs">
              Showing first 6 rows...
            </div>
          )}
        </div>
      )
    }

    // JSON preview
    if (jsonData) {
      return (
        <div className="bg-muted/30 rounded-lg border p-4">
          <pre className="text-foreground overflow-x-auto text-xs">
            {JSON.stringify(jsonData, null, 2).slice(0, 800)}
            {JSON.stringify(jsonData, null, 2).length > 800 && '\n...'}
          </pre>
        </div>
      )
    }

    // Text preview
    if (preview && typeof preview === 'string') {
      return (
        <div className="bg-muted/30 rounded-lg border p-4">
          <pre className="text-foreground text-sm whitespace-pre-wrap">
            {preview}
            {preview.length >= 500 && '\n...'}
          </pre>
        </div>
      )
    }

    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-8">
        <Eye className="mb-2 h-12 w-12 opacity-50" />
        <p>Preview not available for this file type</p>
      </div>
    )
  }

  return (
    <Card className={cn('shadow-soft', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          {getFileIcon()}
          File Preview
        </CardTitle>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>{file.name}</span>
          <Badge variant="outline" className="text-xs">
            {formatFileSize(file.size)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>{renderPreviewContent()}</CardContent>
    </Card>
  )
}

export default FilePreview
