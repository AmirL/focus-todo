import { Card, CardContent } from '@/shared/ui/card';

type Props = {
  children: React.ReactNode;
  title: string;
};

export function ContentSection({ children, title }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-primary">{title}</h2>
      <Card className="bg-muted/40 border-muted">
        <CardContent className="p-4">{children}</CardContent>
      </Card>
    </section>
  );
}
