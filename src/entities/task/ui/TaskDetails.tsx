import { cn } from '@/shared/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { hasCheckboxes } from '@/shared/lib/toggleMarkdownCheckbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { FileText, ListChecks } from 'lucide-react';

interface TaskDetailsProps {
  details: string;
  expanded: boolean;
  onCollapse: () => void;
  onCheckboxToggle?: (checkboxIndex: number) => void;
}

export function TaskDetails({ details, expanded, onCollapse, onCheckboxToggle }: TaskDetailsProps) {
  if (!details || !expanded) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'A') return;
      e.preventDefault();
      onCollapse();
    }
  };

  return (
    <div
      onClick={onCollapse}
      onKeyDown={handleKeyDown}
      className="mt-1 overflow-hidden"
      data-testid="task-details"
      role="button"
      tabIndex={0}
      aria-expanded={true}
      aria-label="Collapse task details"
    >
      <ReactMarkdown
        className="prose prose-sm text-muted-foreground cursor-pointer break-words [&_a]:break-all"
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
          input: ({ type, checked, ...props }) => {
            if (type !== 'checkbox') return <input type={type} checked={checked} {...props} />;

            return (
              <input
                type="checkbox"
                checked={checked ?? false}
                onChange={(e) => {
                  const index = getCheckboxIndexFromEvent(e);
                  if (index >= 0) onCheckboxToggle?.(index);
                }}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                className="cursor-pointer accent-primary h-4 w-4 mr-1"
                data-testid="subtask-checkbox"
              />
            );
          },
          li: ({ children, className, node, ...props }) => {
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
                {...props}
              >
                {children}
              </li>
            );
          },
        }}
      >
        {details}
      </ReactMarkdown>
    </div>
  );
}

interface DescriptionIndicatorProps {
  details: string;
  expanded: boolean;
  onClick: () => void;
}

export function DescriptionIndicator({ details, expanded, onClick }: DescriptionIndicatorProps) {
  const Icon = hasCheckboxes(details) ? ListChecks : FileText;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center rounded-md min-w-[28px] min-h-[28px] px-1.5 py-0.5 cursor-pointer transition-colors',
            'text-muted-foreground hover:text-foreground hover:bg-accent',
            expanded && 'bg-accent text-foreground'
          )}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          data-cy="description-indicator"
          aria-label={expanded ? 'Hide description' : 'Show description'}
          aria-expanded={expanded}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{expanded ? 'Hide description' : 'Show description'}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function getCheckboxIndexFromEvent(e: React.ChangeEvent<HTMLInputElement>): number {
  const container = e.target.closest('[data-testid="task-details"]');
  if (!container) return -1;
  const allCheckboxes = container.querySelectorAll('[data-testid="subtask-checkbox"]');
  return Array.from(allCheckboxes).indexOf(e.target);
}
