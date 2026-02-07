import { useCallback, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { hasCheckboxes } from '@/shared/lib/toggleMarkdownCheckbox';

interface TaskDetailsProps {
  details: string;
  onCheckboxToggle?: (checkboxIndex: number) => void;
}

function getCheckboxIndexFromEvent(e: React.ChangeEvent<HTMLInputElement>): number {
  const container = e.target.closest('[data-testid="task-details"]');
  if (!container) return -1;
  const allCheckboxes = container.querySelectorAll('[data-testid="subtask-checkbox"]');
  return Array.from(allCheckboxes).indexOf(e.target);
}

export function TaskDetails({ details, onCheckboxToggle }: TaskDetailsProps) {
  const hasBoxes = hasCheckboxes(details);
  const [folded, setFolded] = useState(!(onCheckboxToggle && hasBoxes));

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
      className="mt-1 overflow-hidden"
      data-testid="task-details"
      role="button"
      tabIndex={0}
      aria-expanded={!folded}
      aria-label={folded ? "Expand task details" : "Collapse task details"}
    >
      <ReactMarkdown
        className={cn(
          'prose prose-sm text-muted-foreground cursor-pointer break-words [&_a]:break-all',
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
