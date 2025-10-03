import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  ImageIcon,
  Mic,
  Video,
} from 'lucide-react'

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle2 className="h-4 w-4" />
    case 'REVIEW_NEEDED':
      return <Clock className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

export const getStatusColor = (
  status: string
): 'default' | 'secondary' | 'outline' | 'destructive' => {
  switch (status) {
    case 'COMPLETED':
      return 'default'
    case 'REVIEW_NEEDED':
      return 'secondary'
    default:
      return 'destructive'
  }
}

export const getResponseTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'video':
      return <Video className="h-5 w-5" />
    case 'text':
      return <FileText className="h-5 w-5" />
    case 'image':
      return <ImageIcon className="h-5 w-5" />
    case 'audio':
      return <Mic className="h-5 w-5" />
    default:
      return <FileText className="h-5 w-5" />
  }
}
