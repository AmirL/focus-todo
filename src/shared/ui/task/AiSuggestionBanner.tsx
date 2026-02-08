import { Sparkles, Check, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AiSuggestionBannerProps {
  fieldName: string;
  suggestion: string;
  displayValue?: string;
  renderAsMarkdown?: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export function AiSuggestionBanner({
  fieldName,
  suggestion,
  displayValue,
  renderAsMarkdown,
  onAccept,
  onReject,
}: AiSuggestionBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const text = displayValue ?? suggestion;
  const isLong = text.length > 120;
  const displayText = isLong && !expanded ? text.slice(0, 120) + '...' : text;

  return (
    <div
      className="mt-1 flex items-start gap-2 rounded-md border-l-4 border-purple-400 bg-purple-50 px-3 py-2 text-sm"
      data-cy={`ai-suggestion-banner-${fieldName}`}
    >
      <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
      <div className="min-w-0 flex-1">
        <span className="font-medium text-purple-700">AI suggestion: </span>
        {renderAsMarkdown ? (
          <div className="mt-1 max-h-[200px] overflow-y-auto">
            <ReactMarkdown
              className="prose prose-sm text-purple-900 prose-headings:text-purple-900 prose-strong:text-purple-900 prose-a:text-purple-700"
              remarkPlugins={[remarkGfm]}
            >
              {text}
            </ReactMarkdown>
          </div>
        ) : (
          <>
            <span className="text-purple-900">
              {displayText}
            </span>
            {isLong && (
              <button
                type="button"
                className="ml-1 text-purple-600 underline"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'less' : 'more'}
              </button>
            )}
          </>
        )}
      </div>
      <div className="flex flex-shrink-0 gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-green-600 hover:bg-green-100 hover:text-green-700"
          onClick={onAccept}
          data-cy={`accept-suggestion-${fieldName}`}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-red-500 hover:bg-red-100 hover:text-red-600"
          onClick={onReject}
          data-cy={`reject-suggestion-${fieldName}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
