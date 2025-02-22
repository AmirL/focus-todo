import { Textarea } from '@/shared/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Label } from '@/shared/ui/label';

export function MarkdownAreaField(props: { label: string; id: string; value: string }) {
  const { label, id, value: initialValue, ...rest } = props;
  const [activeTab, setActiveTab] = useState('view');
  const [value, setValue] = useState(initialValue);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  return (
    <div>
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <Textarea id={id} value={value} onChange={onChange} className="min-h-[200px]" {...rest} />
        </TabsContent>
        <TabsContent value="view">
          <ReactMarkdown className="prose prose-sm min-h-[200px]">{value}</ReactMarkdown>
        </TabsContent>
      </Tabs>
      <input type="hidden" name={id} value={value} />
    </div>
  );
}
