'use client';
import React from 'react';
import { Button } from '@/shared/ui/button';
import { TaskModel } from '@/entities/task/model/task';
import { Printer } from 'lucide-react';
import {
  filterPrintableTasks,
  groupTasksByList,
  sortTasksByDuration,
  calculateTotalDuration
} from '../lib/printUtils';
import { generatePrintHTML } from '../lib/printTemplate';
import { useListsQuery } from '@/shared/api/lists';
import { buildListIdToNameMap } from '@/shared/lib/listUtils';

interface PrintButtonProps {
  tasks: TaskModel[];
}

export function PrintButton({ tasks }: PrintButtonProps) {
  const { data: lists = [] } = useListsQuery();
  const listNameMap = buildListIdToNameMap(lists);

  const handlePrint = () => {
    const printableTasks = filterPrintableTasks(tasks);
    if (printableTasks.length === 0) return;

    const groupedTasks = groupTasksByList(printableTasks, listNameMap);
    sortTasksByDuration(groupedTasks);
    
    const totalDuration = calculateTotalDuration(printableTasks);
    const firstTaskDate = printableTasks[0]?.date || null;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = generatePrintHTML(
      groupedTasks, 
      printableTasks.length, 
      totalDuration, 
      firstTaskDate
    );

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const printableTasks = filterPrintableTasks(tasks);
  if (printableTasks.length === 0) return null;

  return (
    <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm" onClick={handlePrint}>
      <Printer className="h-4 w-4" />
      <span className="hidden xs:inline sm:inline">Print</span> Tasks
    </Button>
  );
}
