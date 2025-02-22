import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

export function InputField({ label, id, value, ...props }: { label: string; id: string; value: string }) {
  const setCursorToEnd = (event: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      const input = event.target;
      input.setSelectionRange(input.value.length, input.value.length);
    }, 0);
  };

  return (
    <div>
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <Input id={id} name={id} defaultValue={value} type="text" {...props} onFocus={setCursorToEnd} />
    </div>
  );
}
