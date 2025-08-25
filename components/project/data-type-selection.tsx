import React from 'react';
import { FileText, Image, Video, FileSpreadsheet, FileType } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export type DataType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'CSV' | 'PDF';

interface DataTypeSelectionProps {
  onSelect: (type: DataType) => void;
  selected?: DataType;
}

const dataTypes = [
  {
    type: 'TEXT' as DataType,
    icon: FileText,
    title: 'Text',
    description: 'Label text content, documents, or written data',
    examples: 'Reviews, articles, messages, surveys'
  },
  {
    type: 'IMAGE' as DataType,
    icon: Image,
    title: 'Images',
    description: 'Classify, tag, or annotate visual content',
    examples: 'Photos, screenshots, drawings, charts'
  },
  {
    type: 'VIDEO' as DataType,
    icon: Video,
    title: 'Videos',
    description: 'Analyze and label video content',
    examples: 'Clips, recordings, animations'
  },
  {
    type: 'CSV' as DataType,
    icon: FileSpreadsheet,
    title: 'CSV Data',
    description: 'Label structured data from spreadsheets',
    examples: 'Tables, datasets, records'
  },
  {
    type: 'PDF' as DataType,
    icon: FileType,
    title: 'PDF Documents',
    description: 'Annotate and extract information from PDFs',
    examples: 'Reports, forms, contracts, papers'
  }
];

const DataTypeSelection: React.FC<DataTypeSelectionProps> = ({ onSelect, selected }) => {
  return (
    <div className="space-y-6 ">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">What type of data do you want to label?</h2>
        <p className="text-muted-foreground">
          Choose the format of your data to get started with the labeling process
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {dataTypes.map(({ type, icon: Icon, title, description, examples }) => (
          <Card 
            key={type}
            className={`cursor-pointer transition-all bg-black/30 duration-200 hover:shadow-lg ${
              selected === type 
                ? 'ring-2 ring-primary border-primary bg-primary/5' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelect(type)}
          >
            <CardHeader className="text-center pb-3">
              <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                selected === type ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-3">{description}</p>
              <p className="text-xs text-muted-foreground/70">
                <span className="font-medium">Examples:</span> {examples}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selected && (
        <div className="text-center">
          <Button size="lg" onClick={() => {}}>
            Continue with {dataTypes.find(d => d.type === selected)?.title}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DataTypeSelection;