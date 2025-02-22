import { useGoalsStore } from '@/entities/goal/model/goalsStore';
import { MainBlock } from './MainBlock';
import { useEffect } from 'react';
import { Goal } from '@/entities/goal/ui/Goal';

export function Goals() {
  const fetchGoals = useGoalsStore((state) => state.fetchGoals);
  const goals = useGoalsStore((state) => state.goals);

  useEffect(() => {
    if (goals.length == 0) fetchGoals();
  }, [fetchGoals, goals.length]);

  return (
    <>
      <MainBlock title="Goals">
        <div className="flex flex-col w-max">
          {goals.map((goal) => (
            <>
              <Goal goal={goal} key={goal.id} />
            </>
          ))}
        </div>
      </MainBlock>
    </>
  );
}
