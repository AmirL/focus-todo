import { TaskModel } from '@/entities/task/model/task';
import { GroupedTasks, formatDate, formatDuration } from './printUtils';
import { PRINT_STYLES } from './printStyles';

function renderTask(task: TaskModel): string {
  return `
    <div class="task">
      <div class="task-content">
        <div class="task-header">
          <input type="checkbox" class="task-checkbox" />
          <span class="task-name">
            ${task.name}
          </span>
        </div>
        ${task.details ? `<div class="task-details">${task.details}</div>` : ''}
      </div>
      <div class="task-duration">${formatDuration(task.estimatedDuration)}</div>
    </div>
  `;
}

function renderTaskSection(listType: string, tasks: TaskModel[]): string {
  const subtotal = tasks.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0);

  return `
    <div class="section">
      <h2>${listType}</h2>
      ${tasks.map(renderTask).join('')}
      <div class="subtotal">
        Subtotal: ${formatDuration(subtotal)}
      </div>
    </div>
  `;
}

function renderNewTaskLines(): string {
  return Array.from(
    { length: 6 },
    () => `
    <div class="new-task-line">
      <input type="checkbox" class="new-task-checkbox" />
      <div class="new-task-line-border"></div>
    </div>
  `
  ).join('');
}

export function generatePrintHTML(
  groupedTasks: GroupedTasks,
  totalTasks: number,
  totalDuration: number,
  firstTaskDate: Date | null
): string {
  const taskSections = Object.keys(groupedTasks)
    .map((listType) => renderTaskSection(listType, groupedTasks[listType]))
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Daily Tasks - ${formatDate(firstTaskDate)}</title>
        <style>${PRINT_STYLES}</style>
      </head>
      <body>
        <div class="header">
          <h1>Daily Tasks</h1>
          <div class="date-info">${formatDate(firstTaskDate)} • Total: ${formatDuration(totalDuration)}</div>
        </div>

        ${taskSections}

        <div class="footer">
          <span>Total Tasks: ${totalTasks}</span>
          <span>Est. Time: ${formatDuration(totalDuration)}</span>
        </div>

        <div class="new-tasks">
          <h2>Additional Tasks</h2>
          ${renderNewTaskLines()}
        </div>


      </body>
    </html>
  `;
}
