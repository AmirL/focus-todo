import { ContentSection } from './Section';
import { Goal } from '@/entities/goal/ui/Goal';
import { useGoalsLoader } from '../api/useGoalsLoader';
import { EditGoalButton } from '@/features/goals/edit';
import { AddGoalDialog } from '@/features/goals/add';
import { DeleteGoalButton } from '@/features/goals/actions/ui/DeleteGoalButton';

export function Goals() {
  const goals = useGoalsLoader();

  return (
    <>
      <ContentSection title="Goals">
        <div className="space-y-4">
          {goals.map((goal) => (
            <Goal
              key={goal.id}
              goal={goal}
              actionButtons={
                <>
                  <EditGoalButton goal={goal} />
                  <DeleteGoalButton goal={goal} />
                </>
              }
            />
          ))}
          <AddGoalDialog />
        </div>
      </ContentSection>
    </>
  );
}
