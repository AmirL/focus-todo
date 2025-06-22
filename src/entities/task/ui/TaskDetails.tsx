import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import ReactMarkdown from 'react-markdown';

interface TaskDetailsProps {
  details: string;
}

export function TaskDetails({ details }: TaskDetailsProps) {
  const [folded, setFolded] = useState(true);

  if (!details) return <></>;

  return (
    <div onClick={() => setFolded(!folded)} className="mt-1">
      <ReactMarkdown
        className={cn(
          'prose prose-sm text-muted-foreground cursor-pointer',
          folded ? 'line-clamp-1' : 'line-clamp-none'
        )}
      >
        {details}
      </ReactMarkdown>
    </div>
  );
}