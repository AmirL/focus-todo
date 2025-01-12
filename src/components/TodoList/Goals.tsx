import { useGoalsStore } from '@/store/goalsStore';
import { MainBlock } from './MainBlock';
import { useEffect, useState } from 'react';
import { Goal } from '@/data-classes/goal';
import { Progress } from '../ui/progress';

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
              <RenderGoal goal={goal} key={goal.id} />
            </>
          ))}
        </div>
      </MainBlock>
    </>
  );
}

function RenderGoal({ goal }: { goal: Goal }) {
  return (
    <>
      <div className="flex items-center">
        <Progress value={goal.progress} className="mr-4 w-10" />
        <span className="flex-grow truncate">{goal.title}</span>
      </div>
    </>
  );
}
