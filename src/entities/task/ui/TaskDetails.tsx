import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TaskDetailsProps {
  details: string;
}

export function TaskDetails({ details }: TaskDetailsProps) {
  const [folded, setFolded] = useState(true);

  if (!details) return <></>;

  const handleToggle = () => setFolded(!folded);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div 
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className="mt-1" 
      data-testid="task-details"
      role="button"
      tabIndex={0}
      aria-expanded={!folded}
      aria-label={folded ? "Expand task details" : "Collapse task details"}
    >
      <ReactMarkdown
        className={cn(
          'prose prose-sm text-muted-foreground cursor-pointer',
          folded ? 'line-clamp-1' : 'line-clamp-none'
        )}
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
              onClick={(e) => e.stopPropagation()}
              data-testid="auto-link"
              {...props}
            >
              {children}
            </a>
          ),
        }}
      >
        {details}
      </ReactMarkdown>
    </div>
  );
}