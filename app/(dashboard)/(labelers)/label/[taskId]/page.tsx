'use client';

import React, { useState } from 'react';
import {useParams } from 'next/navigation';
import { ArrowLeft, Check, Save, Eye, AlertCircle, FileText, Image as ImageIcon, Database, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

interface TaskFile {
  file_url: string;
  file_name: string;
  file_size_bytes: number;
  file_type: string;
}

interface TaskData {
  file?: TaskFile;
  data: string;
}

interface LabellingChoice {
  option_text: string;
}

interface TaskDetails {
  title: string;
  tasks: TaskData[];
  labelling_choices: LabellingChoice[];
  input_type: 'multiple_choice' | 'text_input';
  labeller_instructions: string;
  task_type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'CSV' | 'PDF';
}

const mockTaskData: Record<string, TaskDetails> = {
  '1': {
    title: 'Product Image Classification',
    tasks: [
      {
        file: {
          file_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
          file_name: 'product1.jpg',
          file_size_bytes: 45000,
          file_type: 'jpg'
        },
        data: 'Classify this product image into the appropriate category'
      },
      {
        file: {
          file_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
          file_name: 'product2.jpg',
          file_size_bytes: 52000,
          file_type: 'jpg'
        },
        data: 'Classify this product image into the appropriate category'
      },
      {
        file: {
          file_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
          file_name: 'product3.jpg',
          file_size_bytes: 48000,
          file_type: 'jpg'
        },
        data: 'Classify this product image into the appropriate category'
      }
    ],
    labelling_choices: [
      { option_text: 'Electronics' },
      { option_text: 'Clothing' },
      { option_text: 'Home & Garden' },
      { option_text: 'Sports' }
    ],
    input_type: 'multiple_choice',
    labeller_instructions: 'Look at each product image and select the most appropriate category. Please be accurate as this helps improve our e-commerce platform.',
    task_type: 'IMAGE'
  },
  '2': {
    title: 'Customer Sentiment Analysis',
    tasks: [
      { data: 'This product exceeded my expectations! Great quality and fast shipping.' },
      { data: 'The item arrived damaged and customer service was unhelpful.' },
      { data: 'It\'s okay, nothing special but does what it\'s supposed to do.' }
    ],
    labelling_choices: [
      { option_text: 'Positive' },
      { option_text: 'Negative' },
      { option_text: 'Neutral' }
    ],
    input_type: 'multiple_choice',
    labeller_instructions: 'Read each customer review carefully and determine the overall sentiment. Consider the language used and the customer\'s satisfaction level.',
    task_type: 'TEXT'
  },
  '3': {
    title: 'Document Information Extraction',
    tasks: [
      { data: 'Extract the company name from this contract document' },
      { data: 'What is the total amount mentioned in this invoice?' }
    ],
    labelling_choices: [],
    input_type: 'text_input',
    labeller_instructions: 'Read the document carefully and provide the requested information in text format. Be accurate and concise.',
    task_type: 'PDF'
  }
};

const getTaskTypeIcon = (type: string) => {
  switch (type) {
    case 'TEXT': return <FileText className="size-5" />;
    case 'IMAGE': return <ImageIcon className="size-5" />;
    case 'VIDEO': return <Video className="size-5" />;
    case 'CSV':
    case 'PDF': return <Database className="size-5" />;
    default: return <FileText className="size-5" />;
  }
};

const LabelTask = () => {
  const { taskId } = useParams();
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [completedItems, setCompletedItems] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [responses, setResponses] = useState<Array<{answer: string, notes: string}>>([]);

  const taskData = mockTaskData[taskId as keyof typeof mockTaskData];
  
  if (!taskData) {
    return <div>Task not found</div>;
  }

  const currentItem = taskData.tasks[currentItemIndex];
  const totalItems = taskData.tasks.length;
  const progress = (completedItems / totalItems) * 100;
  const isLastItem = currentItemIndex === totalItems - 1;

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSubmitLabel = () => {
    if (!selectedCategory || selectedCategory.trim() === '') {
        const toastTitle = taskData.input_type === 'multiple_choice' ? "Please select a category" : "Please provide an answer";
      toast(toastTitle,{
        description: "All items must be labeled before you can continue.",
      });
      return;
    }

    const newResponses = [...responses];
    newResponses[currentItemIndex] = { answer: selectedCategory, notes };
    setResponses(newResponses);

    toast("Label saved",{
      description: taskData.input_type === 'multiple_choice' 
        ? `Item labeled as "${selectedCategory}"`
        : "Your response has been saved",
    });

    setCompletedItems(prev => prev + 1);
    
    if (isLastItem) {
      // Show final submit confirmation modal so they dont submit by mistake
      setShowConfirmDialog(true);
    } else {
      handleNext();
    }
  };

  const handleNext = () => {
    if (currentItemIndex < totalItems - 1) {
      setCurrentItemIndex(prev => prev + 1);
      // Load saved response if it exists
      const savedResponse = responses[currentItemIndex + 1];
      if (savedResponse) {
        setSelectedCategory(savedResponse.answer);
        setNotes(savedResponse.notes);
      } else {
        setSelectedCategory(null);
        setNotes('');
      }
    }
  };

  const handlePrevious = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
      // Load saved response if it exists
      const savedResponse = responses[currentItemIndex - 1];
      if (savedResponse) {
        setSelectedCategory(savedResponse.answer);
        setNotes(savedResponse.notes);
      } else {
        setSelectedCategory(null);
        setNotes('');
      }
    }
  };

  const handleFinalSubmit = () => {
    toast("Task completed successfully!", {
      description: "All your labels have been submitted. Thank you for your work!",
    });
    setShowConfirmDialog(false);
    
  };

//  const allItemsCompleted = completedItems === totalItems;

  return (
    <div className="min-h-screen bg-card/20">

      <header className="border-b bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/label/overview">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
             
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                {completedItems} completed
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
         <div className="flex items-start gap-2 mb-4">
          <div className='pt-1'>
            {getTaskTypeIcon(taskData.task_type)}
          </div>
                <div>
                  <h1 className="text-xl font-semibold">{taskData.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    Item {currentItemIndex + 1} of {totalItems}
                  </p>
                </div>
              </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-soft bg-card/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Content to Label
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentItem.file && (taskData.task_type === 'IMAGE' || taskData.task_type === 'VIDEO') ? (
                  <div className="text-center">
                    {taskData.task_type === 'IMAGE' ? (
                      <Image
                        src={currentItem.file.file_url} 
                        alt={currentItem.file.file_name}
                        width={400}
                        height={300}
                        className="max-w-full h-auto rounded-lg mx-auto"
                        style={{ maxHeight: '400px' }}
                      />
                    ) : (
                      <video 
                        src={currentItem.file.file_url}
                        controls
                        className="max-w-full h-auto rounded-lg mx-auto"
                        style={{ maxHeight: '400px' }}
                      />
                    )}
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">File: {currentItem.file.file_name}</p>
                      <p className="text-lg mt-2">{currentItem.data}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-muted/50 rounded-lg">
                    <p className="text-lg leading-relaxed">{currentItem.data}</p>
                    {currentItem.file && (
                      <div className="mt-4 text-sm text-muted-foreground">
                        <p>Document: {currentItem.file.file_name}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className='bg-card/20 border border-primary'>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {taskData.labeller_instructions}
                </p>
              </CardContent>
            </Card>

            <Card className='bg-card/20'>
              <CardHeader>
                <CardTitle className="text-base">
                  {taskData.input_type === 'multiple_choice' ? 'Select Label Option *' : 'Provide Answer *'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {taskData.input_type === 'multiple_choice' ? (
                  taskData.labelling_choices.map((choice, index) => (
                    <Button
                      key={index}
                      variant={selectedCategory === choice.option_text ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleCategorySelect(choice.option_text)}
                    >
                      {selectedCategory === choice.option_text && <Check className="h-4 w-4 mr-2" />}
                      {choice.option_text}
                    </Button>
                  ))
                ) : (
                  <Textarea
                    placeholder="Enter your response here..."
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                )}
              </CardContent>
            </Card>

            <Card className='bg-card/20'>
              <CardHeader>
                <CardTitle className="text-base">Additional Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add any additional notes or observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button 
                onClick={handleSubmitLabel}
                disabled={!selectedCategory || selectedCategory.trim() === ''}
                className="w-full"
                variant="default"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLastItem ? 'Complete Task' : 'Submit & Continue'}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                * All items must be labeled to complete the task
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handlePrevious}
                disabled={currentItemIndex === 0}
                variant="ghost"
                className="flex-1 bg-card/20"
              >
                Previous
              </Button>
              <Button 
                onClick={handleNext}
                disabled={currentItemIndex === totalItems - 1}
                className="flex-1"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Task Completion</DialogTitle>
            <DialogDescription>
              You have completed all {totalItems} items in this task. Please review your work before final submission.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            <h4 className="font-medium">Review Your Responses:</h4>
            {responses.map((response, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm">
                <div className="font-medium">Item {index + 1}:</div>
                <div className="text-muted-foreground">Answer: {response.answer}</div>
                {response.notes && (
                  <div className="text-muted-foreground">Notes: {response.notes}</div>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Review Again
            </Button>
            <Button onClick={handleFinalSubmit}>
              Submit All Labels
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabelTask;