'use client';

import React, { useState } from 'react';
import { Plus, X, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DataType } from '../data-type-selection';
import TaskItem, { TaskItem as TaskItemType } from './task-item';
import { Button } from '@/components/ui/button';

export type InputType = 'multiple_choice' | 'text_input';

interface TaskConfigurationProps {
  dataType: DataType;
  onConfigChange: (config: TaskConfig) => void;
  initialConfig?: Partial<TaskConfig>;
}

export interface LabellingChoice {
  option_text: string;
}

export interface TaskConfig {
  taskName: string;
  description: string;
  inputType: InputType;
  labellingChoices: LabellingChoice[];
  instructions: string;
  deadline?: Date;  
  labellersRequired: number;
  tasks: TaskItemType[];
}

const TaskConfiguration: React.FC<TaskConfigurationProps> = ({
  dataType,
  onConfigChange,
  initialConfig = {}
}) => {
  const [config, setConfig] = useState<TaskConfig>({
    taskName: initialConfig.taskName || '',
    description: initialConfig.description || '',
    inputType: initialConfig.inputType || 'multiple_choice',
    labellingChoices: initialConfig.labellingChoices || [],
    instructions: initialConfig.instructions || '',
    deadline: initialConfig.deadline,
    labellersRequired: initialConfig.labellersRequired || 1,
    tasks: initialConfig.tasks || [{ id: '1', data: '' }]
  });
  
  const [newChoice, setNewChoice] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const updateConfig = (updates: Partial<TaskConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const addChoice = () => {
    if (newChoice.trim() && !config.labellingChoices.some(choice => choice.option_text === newChoice.trim())) {
      const choices = [...config.labellingChoices, { option_text: newChoice.trim() }];
      updateConfig({ labellingChoices: choices });
      setNewChoice('');
    }
  };

  const removeChoice = (choiceToRemove: string) => {
    const choices = config.labellingChoices.filter(choice => choice.option_text !== choiceToRemove);
    updateConfig({ labellingChoices: choices });
  };

  const addTask = () => {
    const newTask: TaskItemType = {
      id: (config.tasks.length + 1).toString(),
      data: ''
    };
    updateConfig({ tasks: [...config.tasks, newTask] });
  };

  const updateTask = (index: number, updatedTask: TaskItemType) => {
    const tasks = [...config.tasks];
    tasks[index] = updatedTask;
    updateConfig({ tasks });
  };

  const removeTask = (index: number) => {
    if (config.tasks.length > 1) {
      const tasks = config.tasks.filter((_, i) => i !== index);
      updateConfig({ tasks });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addChoice();
    }
  };

  return (
    <Card className="shadow-soft bg-card/20">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Task Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Task Name */}
        <div className="space-y-2">
          <Label htmlFor="task-name" className="text-sm font-medium">
            Task Name *
          </Label>
          <Input
            id="task-name"
            placeholder="e.g., Image Classification for Wildlife Detection"
            value={config.taskName}
            onChange={(e) => updateConfig({ taskName: e.target.value })}
            className="border-border focus:border-primary"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description *
          </Label>
          <Textarea
            id="description"
            placeholder="Describe what this task involves and what kind of data needs to be labeled..."
            value={config.description}
            onChange={(e) => updateConfig({ description: e.target.value })}
            className="min-h-[100px] border-border focus:border-primary resize-none"
          />
        </div>

        {/* Input Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">How should labelers respond? *</Label>
          <RadioGroup 
            value={config.inputType} 
            onValueChange={(value: InputType) => updateConfig({ inputType: value })}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multiple_choice" id="multiple_choice" />
              <Label htmlFor="multiple_choice" className="text-sm cursor-pointer">
                Multiple Choice (Select from options)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="text_input" id="text_input" />
              <Label htmlFor="text_input" className="text-sm cursor-pointer">
                Text Input (Free text response)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Labelling Choices (only for multiple choice) */}
        {config.inputType === 'multiple_choice' && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Labelling Options *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter a labelling option"
                value={newChoice}
                onChange={(e) => setNewChoice(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border-border focus:border-primary"
              />
              <Button 
                onClick={addChoice}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {config.labellingChoices.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {config.labellingChoices.map((choice) => (
                  <Badge 
                    key={choice.option_text} 
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    {choice.option_text}
                    <button
                      onClick={() => removeChoice(choice.option_text)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Task Items */}
        <div className="space-y-4 ">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Task Items *</Label>
            <Button 
              onClick={addTask}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Task Item
            </Button>
          </div>
          
          <div className="space-y-3 ">
            {config.tasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                dataType={dataType}
                onUpdate={(updatedTask) => updateTask(index, updatedTask)}
                onRemove={() => removeTask(index)}
                canRemove={config.tasks.length > 1}
              />
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <Label htmlFor="instructions" className="text-sm font-medium">
            Instructions for Labellers *
          </Label>
          <Textarea
            id="instructions"
            placeholder="Provide clear, detailed instructions for how labellers should approach this task..."
            value={config.instructions}
            onChange={(e) => updateConfig({ instructions: e.target.value })}
            className="min-h-[120px] border-border focus:border-primary resize-none"
          />
        </div>

        {/* Advanced Settings */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-0 h-auto">
              <span className="text-sm font-medium text-primary">
                Advanced Settings {isAdvancedOpen ? '−' : '+'}
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Deadline
                </Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={config.deadline?.toISOString().slice(0, 16) || ''}
                  onChange={(e) => updateConfig({ 
                    deadline: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                  className="border-border focus:border-primary"
                />
              </div>

              {/* Labellers Required */}
              <div className="space-y-2">
                <Label htmlFor="labellers" className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Labellers per Item
                </Label>
                <Input
                  id="labellers"
                  type="number"
                  min="1"
                  max="10"
                  value={config.labellersRequired}
                  onChange={(e) => updateConfig({ 
                    labellersRequired: parseInt(e.target.value) || 1 
                  })}
                  className="border-border focus:border-primary"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default TaskConfiguration;