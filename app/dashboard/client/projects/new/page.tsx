'use client'

import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Upload, Settings } from 'lucide-react';
import {  useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import DataTypeSelection, { DataType } from '@/components/project/data-type-selection';
import TaskConfiguration, { TaskConfig } from '@/components/project/task/task-configurations';

enum AnnotationStep {
  DATA_TYPE = 'data_type',
  CONFIGURE = 'configure',
  PREVIEW = 'preview',
  SUBMIT = 'submit'
}

const Annotate = () => {
  const [currentStep, setCurrentStep] = useState<AnnotationStep>(AnnotationStep.DATA_TYPE);
  const [dataType, setDataType] = useState<DataType | null>(null);
  const [taskConfig, setTaskConfig] = useState<TaskConfig>({
    taskName: '',
    description: '',
    inputType: 'multiple_choice',
    labellingChoices: [],
    instructions: '',
    labellersRequired: 1,
    tasks: [{ id: '1', data: '' }]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const stepLabels = {
    [AnnotationStep.DATA_TYPE]: 'Select Data Type',
    [AnnotationStep.CONFIGURE]: 'Configure Task',
    [AnnotationStep.PREVIEW]: 'Review & Preview',
    [AnnotationStep.SUBMIT]: 'Success'
  };

  const getStepNumber = (step: AnnotationStep): number => {
    return Object.values(AnnotationStep).indexOf(step) + 1;
  };

  const getCurrentProgress = (): number => {
    return (getStepNumber(currentStep) / Object.values(AnnotationStep).length) * 100;
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case AnnotationStep.DATA_TYPE:
        return !!dataType;
      case AnnotationStep.CONFIGURE:
        return !!(taskConfig.taskName && taskConfig.description && 
                 taskConfig.instructions && taskConfig.tasks.length > 0 &&
                 taskConfig.tasks.every(task => task.data.trim()) &&
                 (taskConfig.inputType === 'text_input' || taskConfig.labellingChoices.length > 0));
      case AnnotationStep.PREVIEW:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const steps = Object.values(AnnotationStep);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps = Object.values(AnnotationStep);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const validateAndSubmit = async () => {
    if (!dataType || !canProceed()) {
      toast( "Validation Error", {
       description: "Please complete all required fields before submitting."
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
   
      const apiPayload = {
        tasks: taskConfig.tasks,
        labelling_choices: taskConfig.labellingChoices,
        input_type: taskConfig.inputType,
        labeller_instructions: taskConfig.instructions,
        deadline: taskConfig.deadline?.toISOString().split('T')[0] || "2025-08-21",
        labeller_per_item_count: taskConfig.labellersRequired,
        task_type: dataType,
        annotation_method: "manual",
        project: 1
      };
      
      console.log('API Payload:', JSON.stringify(apiPayload, null, 2));

      // TODO: Replace with API call FROM Backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentStep(AnnotationStep.SUBMIT);
      toast("Task Submitted Successfully!", {
        description: "Your annotation task has been created and will be processed by our labellers.",
      });
    } catch (error) {
        console.log('Submission Error:', error);
      toast("Submission Failed", {
        description: "There was an error submitting your task. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case AnnotationStep.DATA_TYPE:
        return (
          <DataTypeSelection 
            onSelect={(type) => {
              setDataType(type);
              setTimeout(() => handleNext(), 300);
            }}
            selected={dataType || undefined}
          />
        );

      case AnnotationStep.CONFIGURE:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Configure Your Task</h2>
              <p className="text-muted-foreground">
                Set up how you want your {dataType?.toLowerCase()} data labeled
              </p>
            </div>
            <div className="max-w-4xl bg-black/5 mx-auto">
              <TaskConfiguration 
                dataType={dataType!}
                onConfigChange={setTaskConfig}
                initialConfig={taskConfig}
              />
            </div>
          </div>
        );

      case AnnotationStep.PREVIEW:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Review & Preview</h2>
              <p className="text-muted-foreground">
                Confirm your task details and data preview
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-soft bg-card/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Task Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Data Type</h4>
                        <p className="font-semibold">{dataType}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Task Name</h4>
                        <p className="font-semibold">{taskConfig.taskName}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Description</h4>
                        <p className="text-sm">{taskConfig.description}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Input Type</h4>
                        <p className="text-sm capitalize">{taskConfig.inputType.replace('_', ' ')}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {taskConfig.inputType === 'multiple_choice' && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Labelling Options</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {taskConfig.labellingChoices.map(choice => (
                              <span key={choice.option_text} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                                {choice.option_text}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Task Items</h4>
                        <p className="text-sm">{taskConfig.tasks.length} items</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Labellers Required</h4>
                        <p className="text-sm">{taskConfig.labellersRequired} per item</p>
                      </div>
                      {taskConfig.deadline && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Deadline</h4>
                          <p className="text-sm">{taskConfig.deadline.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Sample Tasks Preview</h4>
                    <div className="bg-muted/50 border border-primary rounded-lg p-4 space-y-2 max-h-32 overflow-y-auto">
                      {taskConfig.tasks.slice(0, 3).map((task, index) => (
                        <div key={task.id} className="text-sm">
                          <span className="font-medium">Task {index + 1}:</span> {task.data.slice(0, 100)}{task.data.length > 100 ? '...' : ''}
                        </div>
                      ))}
                      {taskConfig.tasks.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          ... and {taskConfig.tasks.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case AnnotationStep.SUBMIT:
        return (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <CheckCircle className="h-16 w-16 text-success mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Task Submitted Successfully!</h2>
              <p className="text-muted-foreground mb-8">
                {`Your annotation task "${taskConfig.taskName}" has been created and will be processed by our labellers. 
                You'll receive updates as work progresses.`}
              </p>
              <div className="space-y-3">
                <Button onClick={() => router.push('/dashboard')} className="w-full h-12">
                  Go to Dashboard
                </Button>
                <Button 
                  onClick={() => {
                    setCurrentStep(AnnotationStep.DATA_TYPE);
                    setDataType(null);
                    setTaskConfig({
                      taskName: '',
                      description: '',
                      inputType: 'multiple_choice',
                      labellingChoices: [],
                      instructions: '',
                      labellersRequired: 1,
                      tasks: [{ id: '1', data: '' }]
                    });
                  }}
                  variant="outline" 
                  className="w-full bg-transparent border-primary h-12"
                >
                  Create Another Task
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-card/20">
     
      <header className="border-b bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
             
                <Button onClick={() => router.back()} variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
             
              <div>
                <h1 className="text-xl font-semibold">Annotate a Task</h1>
                <p className="text-sm text-muted-foreground">
                  Upload your dataset and configure how you want it labeled
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {currentStep !== AnnotationStep.SUBMIT && (
        <div className="border-b bg-card/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Step {getStepNumber(currentStep)} of {Object.values(AnnotationStep).length - 1}
              </span>
              <span className="text-sm text-muted-foreground">
                {stepLabels[currentStep]}
              </span>
            </div>
            <Progress value={getCurrentProgress()} className="h-2" />
          </div>
        </div>
      )}


      <main className="container mx-auto px-4 py-8">
        {renderStepContent()}
      </main>

     
      {currentStep !== AnnotationStep.SUBMIT && (
        <footer className="border-t backdrop-blur-sm sticky bottom-0">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentStep === AnnotationStep.DATA_TYPE}
              >
                Back
              </Button>
              
              {currentStep === AnnotationStep.PREVIEW ? (
                <Button 
                  onClick={validateAndSubmit}
                  disabled={!canProceed() || isSubmitting}
                 // variant="hero"
                >
                  {isSubmitting ? (
                    <>
                      <Upload className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Task'
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  disabled={!canProceed()}
                  variant="default"
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Annotate;