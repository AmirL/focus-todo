'use client';

import { ListManager } from '@/features/lists';

export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your preferences and customize your workflow.
          </p>
        </div>
        
        <ListManager />
      </div>
    </div>
  );
}