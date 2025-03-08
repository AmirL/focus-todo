import { ContentSection } from './Section';
import { Goal } from '@/entities/goal/ui/Goal';
import { useGoalsLoader } from '../api/useGoalsLoader';
import { Progress } from '@/shared/ui/progress';

export function Goals() {
  const goals = useGoalsLoader();

  return (
    <>
      <ContentSection title="Goals">
        <div className="space-y-4">
          {goals.map((goal) => (
            <Goal goal={goal} key={goal.id} />
          ))}
        </div>
      </ContentSection>
    </>
  );
}
