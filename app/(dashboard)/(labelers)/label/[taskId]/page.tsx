// File: app/label/[taskId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Save,
  Eye,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Database,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

// API helpers (you added these earlier)
import { fetchTaskById, annotateTask, annotateMissingAsset } from '@/services/apis/clusters';

interface TaskFile {
  file_url?: string;
  file_name?: string;
  file_size_bytes?: number;
  file_type?: string;
}

interface ApiTaskItem {
  id?: number;
  serial_no?: string;
  task_type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'PDF' | 'CSV';
  data?: string;
  file?: TaskFile;
  // other fields omitted for brevity
}

interface ApiTaskResponse {
  id?: number;
  tasks?: ApiTaskItem[];
  labelling_choices?: Array<{ option_text: string }>;
  input_type?: 'multiple_choice' | 'text_input';
  labeller_instructions?: string;
  task_type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'PDF' | 'CSV';
  // other fields...
}

const getTaskTypeIcon = (type?: string) => {
  switch (type) {
    case 'TEXT': return <FileText className="size-5" />;
    case 'IMAGE': return <ImageIcon className="size-5" />;
    case 'VIDEO': return <Video className="size-5" />;
    case 'CSV':
    case 'PDF': return <Database className="size-5" />;
    default: return <FileText className="size-5" />;
  }
};

const FALLBACK_LABELS = [
  { option_text: 'Electronics' },
  { option_text: 'Clothing' },
  { option_text: 'Home & Garden' },
  { option_text: 'Sports' }
];

const LabelTask: React.FC = () => {
  const { taskId } = useParams();
  const router = useRouter();

  const [taskData, setTaskData] = useState<ApiTaskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [completedItems, setCompletedItems] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [responses, setResponses] = useState<Array<{ answer: string; notes: string }>>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!taskId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const resp = await fetchTaskById(taskId);
        const payload: ApiTaskResponse = resp?.data ? resp.data : resp;

        if (cancelled) return;
        setTaskData(payload || null);

        const items = payload?.tasks ?? [];
        setResponses(new Array(items.length).fill({ answer: '', notes: '' }));
        setCompletedItems(0);
        setCurrentItemIndex(0);
        setSelectedCategory(null);
        setNotes('');
      } catch (err: any) {
        console.error('Failed to fetch task', err);
        setError('Failed to load task. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [taskId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading task...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><div className="p-6 bg-red-50 text-red-700 rounded">{error}</div></div>;
  if (!taskData) return <div className="min-h-screen flex items-center justify-center">Task not found</div>;

  const items = taskData.tasks ?? [];
  const totalItems = items.length;
  const currentItem = items[currentItemIndex] ?? { data: '' };
  const inputType = taskData.input_type ?? 'multiple_choice';
  const labellingChoices = taskData.labelling_choices ?? [];
  const progress = totalItems === 0 ? 0 : (completedItems / totalItems) * 100;
  const isLastItem = currentItemIndex === totalItems - 1;

  const choicesToShow = (labellingChoices.length > 0) ? labellingChoices : FALLBACK_LABELS;
  const hasFile = !!(currentItem?.file && (currentItem.file.file_url || currentItem.file.file_name));
  const itemType = currentItem?.task_type ?? taskData.task_type ?? 'TEXT';

  // --- Handlers ---
  const handleCategorySelect = (category: string) => setSelectedCategory(category);

  const handleSubmitLabelLocal = () => {
    if (inputType === 'multiple_choice' && (!selectedCategory || selectedCategory.trim() === '')) {
      toast('Please select a category', { description: 'All items must be labeled before you can continue.' });
      return;
    }
    if (inputType === 'text_input' && (!selectedCategory || selectedCategory.trim() === '')) {
      toast('Please provide an answer', { description: 'All items must be labeled before you can continue.' });
      return;
    }

    const newResponses = [...responses];
    newResponses[currentItemIndex] = { answer: selectedCategory || '', notes };
    setResponses(newResponses);

    toast('Label saved', { description: inputType === 'multiple_choice' ? `Item labeled as "${selectedCategory}"` : 'Your response has been saved' });
    setCompletedItems(prev => prev + 1);

    if (isLastItem) setShowConfirmDialog(true);
    else handleNext();
  };

  const handleNext = () => {
    if (currentItemIndex < totalItems - 1) {
      const nextIndex = currentItemIndex + 1;
      setCurrentItemIndex(nextIndex);
      const saved = responses[nextIndex];
      if (saved) {
        setSelectedCategory(saved.answer || null);
        setNotes(saved.notes || '');
      } else {
        setSelectedCategory(null);
        setNotes('');
      }
    }
  };

  const handlePrevious = () => {
    if (currentItemIndex > 0) {
      const prevIndex = currentItemIndex - 1;
      setCurrentItemIndex(prevIndex);
      const saved = responses[prevIndex];
      if (saved) {
        setSelectedCategory(saved.answer || null);
        setNotes(saved.notes || '');
      } else {
        setSelectedCategory(null);
        setNotes('');
      }
    }
  };

  // Mark missing — now persists immediately via annotateMissingAsset
  const handleMarkMissing = async () => {
    const taskIdToSend = taskData?.id ?? Number(taskId);
    const serial = currentItem?.serial_no ?? currentItem?.id;
    const noteForServer = `Marked missing${serial ? ` (serial: ${serial})` : ''}`;

    try {
      setIsSubmitting(true);
      const resp = await annotateMissingAsset(Number(taskIdToSend), noteForServer);
      // resp is expected to be the API response object
      toast('Marked as missing', { description: resp?.message ?? 'Missing asset recorded' });

      // update local responses so the UI reflects the missing marker
      const newResponses = [...responses];
      newResponses[currentItemIndex] = { answer: 'MISSING_ASSET', notes: noteForServer };
      setResponses(newResponses);
      setCompletedItems(prev => prev + 1);

      if (isLastItem) {
        setShowConfirmDialog(true);
      } else {
        handleNext();
      }
    } catch (err: any) {
      // If server says "You have already labeled this task" or similar, surface it and redirect
      const status = err?.response?.status;
      const data = err?.response?.data;
      const detail = data?.detail || data?.message || err?.message || '';

      if (status === 400 && typeof detail === 'string' && detail.toLowerCase().includes('already label')) {
        toast('You already labeled this task', { description: detail || 'This task has already been labeled.' });
        router.push('/label/overview');
        return;
      }

      console.error('Mark missing failed', err);
      toast('Failed to mark missing', { description: detail || 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build labels (notes preferred over answer)
  const buildLabelsForSubmission = () => {
    const labels: string[] = [];

    for (const r of responses) {
      if (r.notes && r.notes.trim() !== '') {
        labels.push(r.notes.trim());
        continue;
      }
      if (r.answer && r.answer.trim() !== '') {
        labels.push(r.answer.trim());
        continue;
      }
      // skip empties
    }

    return labels;
  };

  // Submit labels using annotateTask helper
  const submitLabels = async () => {
    const labels = buildLabelsForSubmission();

    if (labels.length === 0) {
      toast('No labels to submit', { description: 'Please label at least one item or add notes.' });
      return;
    }

    const payload = {
      task_id: taskData?.id ?? Number(taskId),
      labels
    };

    try {
      setIsSubmitting(true);
      const resp = await annotateTask(payload);
      // Success
      toast('Task labels submitted successfully', { description: resp?.message ?? 'Submission succeeded' });
      setShowConfirmDialog(false);
      router.push('/label/overview');
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const detail = data?.detail || data?.message || err?.message || '';

      // Specific: user already labeled this task
      if (status === 400 && typeof detail === 'string' && detail.toLowerCase().includes('already label')) {
        toast('You already labeled this task', { description: detail || 'This task has already been labeled.' });
        setShowConfirmDialog(false);
        router.push('/label/overview');
        return;
      }

      if (status === 401 || status === 403) {
        toast('Not authorized', { description: detail || 'Please sign in and try again.' });
        setShowConfirmDialog(false);
        return;
      }

      console.error('Annotate failed', status, data || err);
      toast('Failed to submit labels', { description: detail || 'An error occurred while submitting labels.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    await submitLabels();
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-card/20">
      <header className="border-b bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/label/overview">
                <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Button>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{completedItems} completed</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-start gap-2 mb-4">
          <div className="pt-1">{getTaskTypeIcon(taskData.task_type)}</div>
          <div>
            <h1 className="text-xl font-semibold">{(taskData as any).title ?? `Task #${taskData.id ?? taskId}`}</h1>
            <p className="text-sm text-muted-foreground">Item {currentItemIndex + 1} of {totalItems}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT (left) */}
          <div className="lg:col-span-2">
            <Card className="shadow-soft bg-card/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-primary" /> Content to Label</CardTitle>
              </CardHeader>

              <CardContent>
                {(() => {
                  const fileUrl = currentItem?.file?.file_url;
                  const fileName = currentItem?.file?.file_name;
                  const serial = currentItem?.serial_no ?? currentItem?.id;
                  const description = currentItem?.data ?? '';

                  const isMissingMedia = (itemType === 'IMAGE' || itemType === 'VIDEO') && !fileUrl && (!description || description.trim() === '');

                  const renderCsvPreview = (csvText: string) => {
                    try {
                      const rows = csvText.split('\n').map(r => r.split(',').map(c => c.trim())).filter(r => r.length > 0);
                      const head = rows[0] ?? [];
                      const sample = rows.slice(1, 6);
                      return (
                        <div className="mt-4 overflow-auto rounded bg-muted/10 p-2">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr>{head.map((h, i) => <th key={i} className="px-2 py-1 text-left font-medium">{h || `col${i+1}`}</th>)}</tr>
                            </thead>
                            <tbody>
                              {sample.map((r, ri) => <tr key={ri}>{r.map((cell, ci) => <td key={ci} className="px-2 py-1">{cell}</td>)}</tr>)}
                            </tbody>
                          </table>
                        </div>
                      );
                    } catch { return null; }
                  };

                  if (isMissingMedia) {
                    return (
                      <div className="text-center">
                        <div className="mt-4 p-8 bg-muted/20 rounded-lg border-2 border-dashed">
                          <div className="flex flex-col items-center gap-4">
                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground text-center">No {itemType?.toLowerCase()} provided for this item.</p>
                            <p className="text-sm text-muted-foreground text-center">{serial ? `Serial: ${serial}` : `Item ID: ${currentItem?.id ?? '—'}`}</p>
                            <div className="flex gap-2 mt-4">
                              <Button variant="outline" onClick={handleMarkMissing} disabled={isSubmitting}>Mark Missing</Button>
                              <Button onClick={handleNext}>Skip</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (fileUrl) {
                    if (itemType === 'IMAGE') {
                      return (
                        <div className="text-center">
                          <Image src={fileUrl} alt={fileName ?? `image-${currentItem?.id}`} width={800} height={600} className="max-w-full h-auto rounded-lg mx-auto" style={{ maxHeight: '400px' }} />
                          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                            {fileName && <p className="text-sm text-muted-foreground">File: {fileName}</p>}
                            <p className="text-lg mt-2">{description}</p>
                          </div>
                        </div>
                      );
                    }

                    if (itemType === 'VIDEO') {
                      return (
                        <div className="text-center">
                          <video src={fileUrl} controls className="max-w-full h-auto rounded-lg mx-auto" style={{ maxHeight: '400px' }} />
                          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                            {fileName && <p className="text-sm text-muted-foreground">File: {fileName}</p>}
                            <p className="text-lg mt-2">{description}</p>
                          </div>
                        </div>
                      );
                    }

                    if (itemType === 'PDF') {
                      return (
                        <div className="text-center">
                          <iframe src={fileUrl} title={fileName || `pdf-${currentItem?.id}`} className="w-full rounded-lg mx-auto" style={{ height: 520, border: 0 }} />
                          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                            {fileName && <p className="text-sm text-muted-foreground">File: <a href={fileUrl} target="_blank" rel="noreferrer" className="underline">{fileName}</a></p>}
                            <p className="text-lg mt-2">{description}</p>
                          </div>
                        </div>
                      );
                    }

                    if (itemType === 'CSV') {
                      return (
                        <div>
                          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                            {fileName && <p className="text-sm text-muted-foreground">File: <a href={fileUrl} target="_blank" rel="noreferrer" className="underline">{fileName}</a></p>}
                            <p className="text-lg mt-2">{description}</p>
                          </div>
                          {description && description.includes(',') && renderCsvPreview(description)}
                        </div>
                      );
                    }

                    return (
                      <div className="p-6 bg-muted/50 rounded-lg">
                        {fileName ? <p className="text-sm text-muted-foreground">File: <a href={fileUrl} target="_blank" rel="noreferrer" className="underline">{fileName}</a></p> : null}
                        <p className="text-lg leading-relaxed mt-2">{description || 'No content available'}</p>
                      </div>
                    );
                  }

                  return (
                    <div className="p-6 bg-muted/50 rounded-lg">
                      <p className="text-lg leading-relaxed">{description || 'No content available'}</p>
                      {currentItem?.file?.file_name && (
                        <div className="mt-4 text-sm text-muted-foreground">
                          <p>Document: {currentItem.file.file_name}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            <Card className="bg-card/20 border border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><AlertCircle className="h-4 w-4 text-primary" /> Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{taskData.labeller_instructions ?? 'Follow the instructions provided for this task.'}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/20">
              <CardHeader>
                <CardTitle className="text-base">{inputType === 'multiple_choice' ? 'Select Label Option *' : 'Provide Answer *'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {inputType === 'multiple_choice' ? (
                  choicesToShow.map((choice, index) => (
                    <Button key={index} variant={selectedCategory === choice.option_text ? 'default' : 'outline'} className="w-full justify-start" onClick={() => handleCategorySelect(choice.option_text)}>
                      {selectedCategory === choice.option_text && <Check className="h-4 w-4 mr-2" />}
                      {choice.option_text}
                    </Button>
                  ))
                ) : (
                  <Textarea placeholder="Enter your response here..." value={selectedCategory || ''} onChange={(e) => setSelectedCategory(e.target.value)} className="min-h-[100px] resize-none" />
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/20">
              <CardHeader><CardTitle className="text-base">Additional Notes (Optional)</CardTitle></CardHeader>
              <CardContent>
                <Textarea placeholder="Add any additional notes or observations..." value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[80px]" />
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button onClick={handleSubmitLabelLocal} disabled={inputType === 'multiple_choice' ? (!selectedCategory || selectedCategory.trim() === '') : false} className="w-full" variant="default">
                <Save className="h-4 w-4 mr-2" />
                {isLastItem ? 'Complete Task' : 'Submit & Continue'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">* All items must be labeled to complete the task</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handlePrevious} disabled={currentItemIndex === 0} variant="ghost" className="flex-1 bg-card/20">Previous</Button>
              <Button onClick={handleNext} disabled={currentItemIndex === totalItems - 1} className="flex-1">Next</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="py-8 border shadow-sm">
          <DialogHeader>
            <DialogTitle>Confirm Task Completion</DialogTitle>
            <DialogDescription>You have completed all {totalItems} items in this task. Please review your work before final submission.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            <h4 className="font-medium">Review Your Responses:</h4>
            {responses.map((response, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm">
                <div className="font-medium">Item {index + 1}:</div>
                <div className="text-muted-foreground">Answer: {response.answer}</div>
                {response.notes && <div className="text-muted-foreground">Notes: {response.notes}</div>}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Review Again</Button>
            <Button onClick={handleFinalSubmit} disabled={isSubmitting}>{isSubmitting ? 'Submitting…' : 'Submit All Labels'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabelTask;
