import { Card, CardContent } from '@/shared/ui/card';

type Props = {
  children: React.ReactNode;
  title: string;
};

export function ContentSection({ children, title }: Props) {
  return (
    <section className="space-y-4 w-full">
      <h2 className="text-lg font-semibold text-primary">{title}</h2>
      <Card className="bg-white border-border/50 w-full">
        <CardContent className="p-4">{children}</CardContent>
      </Card>
    </section>
  );
}
