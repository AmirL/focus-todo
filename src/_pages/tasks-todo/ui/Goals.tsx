import { ContentSection } from './Section';
import { Goal } from '@/entities/goal';
import { useGoalsLoader } from '../api/useGoalsLoader';
import { EditGoalButton } from '@/features/goals/edit';
import { AddGoalDialog } from '@/features/goals/add';
import { DeleteGoalButton } from '@/features/goals/actions';

export function Goals() {
  const { goals, isLoading, error } = useGoalsLoader();

  if (error) {
    return (
      <ContentSection title="Goals">
        <div className="flex justify-center items-center h-20 text-red-500">
          <div className="text-center">
            <p className="font-semibold">Error loading goals</p>
            <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
          </div>
        </div>
      </ContentSection>
    );
  }

  if (isLoading && goals.length === 0) {
    return (
      <ContentSection title="Goals">
        <div className="flex justify-center items-center h-5">Loading...</div>
      </ContentSection>
    );
  }

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
