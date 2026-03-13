import { Textarea } from '@/shared/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { useCallback, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Label } from '@/shared/ui/label';
import { toggleMarkdownCheckbox } from '@/shared/lib/toggleMarkdownCheckbox';
import { cn } from '@/shared/lib/utils';

function getCheckboxIndexFromEvent(e: React.ChangeEvent<HTMLInputElement>): number {
  const container = e.target.closest('[data-md-view]');
  if (!container) return -1;
  const allCheckboxes = container.querySelectorAll('[data-cy="subtask-checkbox"]');
  return Array.from(allCheckboxes).indexOf(e.target);
}

export function MarkdownAreaField(props: {
  label: string;
  id: string;
  value: string;
  onChange?: (value: string) => void;
}) {
  const { label, id, value, onChange: onChangeParent, ...rest } = props;
  const [activeTab, setActiveTab] = useState('view');
  const valueRef = useRef(value);
  valueRef.current = value;

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (onChangeParent) {
      onChangeParent(newValue);
    }
  };

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const index = getCheckboxIndexFromEvent(e);
    if (index >= 0 && onChangeParent) {
      onChangeParent(toggleMarkdownCheckbox(valueRef.current, index));
    }
  }, [onChangeParent]);

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
          <div data-md-view>
            <ReactMarkdown
              className="prose prose-sm min-h-[200px]"
              remarkPlugins={[remarkGfm]}
              components={{
                input: ({ type, checked, ...inputProps }) => {
                  if (type !== 'checkbox') return <input type={type} checked={checked} {...inputProps} />;
                  return (
                    <input
                      type="checkbox"
                      checked={checked ?? false}
                      onChange={handleCheckboxChange}
                      className="cursor-pointer accent-primary h-4 w-4 mr-1"
                      data-cy="subtask-checkbox"
                    />
                  );
                },
                li: ({ children, className, node, ...liProps }) => {
                  const isTaskItem = className?.includes('task-list-item');
                  const isChecked = isTaskItem && node?.children?.some(
                    (child) => (child as { tagName?: string; properties?: { checked?: boolean } }).tagName === 'input' &&
                      (child as { properties?: { checked?: boolean } }).properties?.checked
                  );
                  return (
                    <li
                      className={cn(
                        className,
                        isTaskItem && 'list-none',
                        isChecked && 'text-muted-foreground line-through'
                      )}
                      {...liProps}
                    >
                      {children}
                    </li>
                  );
                },
              }}
            >
              {value}
            </ReactMarkdown>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
