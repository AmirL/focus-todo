export const PRINT_STYLES = `
  @page {
    size: A4;
    margin: 0.3in;
  }
  
  body {
    font-size: 12pt;
    line-height: 1.3;
    color: black;
    background: white;
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    width: 100%;
    max-width: none;
  }
  
  .header {
    margin-bottom: 16px;
    border-bottom: 2px solid #1f2937;
    padding-bottom: 8px;
  }
  
  .header h1 {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    margin: 0 0 4px 0;
  }
  
  .header .date-info {
    font-size: 16px;
    text-align: center;
    color: #6b7280;
    margin: 0;
  }
  
  .section {
    margin-top: 24px;
  }
  
  .section:first-of-type {
    margin-top: 0;
  }
  
  .section h2 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
    border-bottom: 1px solid #9ca3af;
    padding-bottom: 4px;
  }
  
  .task {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 4px;
    margin-bottom: 8px;
  }
  
  .task-content {
    flex: 1;
    margin-right: 8px;
  }
  
  .task-header {
    display: flex;
    align-items: center;
  }
  
  .task-checkbox {
    margin-right: 8px;
    width: 12px;
    height: 12px;
    border: 1px solid #9ca3af;
  }
  
  .task-name {
    font-size: 16px;
    font-weight: 500;
  }
  
  .task-details {
    font-size: 14px;
    color: #6b7280;
    margin-left: 20px;
    margin-top: 4px;
  }
  
  .task-duration {
    font-size: 14px;
    color: #6b7280;
    white-space: nowrap;
  }
  
  .subtotal {
    margin-top: 8px;
    font-size: 14px;
    color: #6b7280;
  }
  
  .new-tasks {
    margin-top: 24px;
  }
  
  .new-task-line {
    display: flex;
    align-items: center;
    padding-bottom: 4px;
    margin-bottom: 12px;
  }
  
  .new-task-checkbox {
    margin-right: 8px;
    width: 12px;
    height: 12px;
    border: 1px solid #9ca3af;
  }
  
  .new-task-line-border {
    flex: 1;
    border-bottom: 1px dotted #d1d5db;
    height: 20px;
  }
  
  .footer {
    margin-top: 24px;
    padding-top: 12px;
    border-top: 1px solid #9ca3af;
    font-size: 14px;
    color: #6b7280;
    display: flex;
    justify-content: space-between;
  }
  
  .notes {
    margin-top: 16px;
    border-top: 1px solid #d1d5db;
    padding-top: 12px;
  }
  
  .notes h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .note-line {
    border-bottom: 1px solid #e5e7eb;
    height: 16px;
    margin-bottom: 4px;
  }
`;