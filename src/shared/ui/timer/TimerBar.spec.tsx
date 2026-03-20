import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimerBar } from './TimerBar';

describe('TimerBar', () => {
  const defaultProps = {
    taskName: 'Test Task',
    startTime: '09:30',
    duration: '1:30:00',
  };

  it('renders task name', () => {
    render(<TimerBar {...defaultProps} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders with data-cy attribute', () => {
    render(<TimerBar {...defaultProps} />);
    expect(document.querySelector('[data-cy="timer-bar"]')).toBeInTheDocument();
  });

  it('renders duration', () => {
    render(<TimerBar {...defaultProps} />);
    expect(screen.getByText('1:30:00')).toBeInTheDocument();
  });

  it('renders stop button when running', () => {
    render(<TimerBar {...defaultProps} isRunning />);
    expect(document.querySelector('[data-cy="timer-stop-button"]')).toBeInTheDocument();
  });

  it('renders start again button when stopped', () => {
    render(<TimerBar {...defaultProps} isRunning={false} endTime="11:00" />);
    expect(document.querySelector('[data-cy="timer-start-again-button"]')).toBeInTheDocument();
  });

  it('renders dismiss button', () => {
    render(<TimerBar {...defaultProps} />);
    expect(document.querySelector('[data-cy="timer-dismiss-button"]')).toBeInTheDocument();
  });

  it('calls onStop when stop is clicked', () => {
    const onStop = vi.fn();
    render(<TimerBar {...defaultProps} isRunning onStop={onStop} />);
    fireEvent.click(document.querySelector('[data-cy="timer-stop-button"]')!);
    expect(onStop).toHaveBeenCalledOnce();
  });

  it('calls onStartAgain when start again is clicked', () => {
    const onStartAgain = vi.fn();
    render(<TimerBar {...defaultProps} isRunning={false} endTime="11:00" onStartAgain={onStartAgain} />);
    fireEvent.click(document.querySelector('[data-cy="timer-start-again-button"]')!);
    expect(onStartAgain).toHaveBeenCalledOnce();
  });

  it('calls onDismiss when dismiss is clicked', () => {
    const onDismiss = vi.fn();
    render(<TimerBar {...defaultProps} onDismiss={onDismiss} />);
    fireEvent.click(document.querySelector('[data-cy="timer-dismiss-button"]')!);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('shows "Saving..." status', () => {
    render(<TimerBar {...defaultProps} saveStatus="saving" />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('shows "Saved" status', () => {
    render(<TimerBar {...defaultProps} saveStatus="saved" />);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('shows "Failed" status on error', () => {
    render(<TimerBar {...defaultProps} saveStatus="error" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders start time input', () => {
    render(<TimerBar {...defaultProps} />);
    expect(document.querySelector('[data-cy="timer-start-input"]')).toBeInTheDocument();
  });

  it('renders end time input when stopped', () => {
    render(<TimerBar {...defaultProps} isRunning={false} endTime="11:00" />);
    expect(document.querySelector('[data-cy="timer-end-input"]')).toBeInTheDocument();
  });

  it('does not render end time input when running', () => {
    render(<TimerBar {...defaultProps} isRunning />);
    expect(document.querySelector('[data-cy="timer-end-input"]')).not.toBeInTheDocument();
  });

  it('calls onStartTimeChange when start time changes', () => {
    const onStartTimeChange = vi.fn();
    render(<TimerBar {...defaultProps} onStartTimeChange={onStartTimeChange} />);
    const input = document.querySelector('[data-cy="timer-start-input"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '10:00' } });
    expect(onStartTimeChange).toHaveBeenCalledWith('10:00');
  });

  it('calls onEndTimeChange when end time changes', () => {
    const onEndTimeChange = vi.fn();
    render(<TimerBar {...defaultProps} isRunning={false} endTime="11:00" onEndTimeChange={onEndTimeChange} />);
    const input = document.querySelector('[data-cy="timer-end-input"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '12:00' } });
    expect(onEndTimeChange).toHaveBeenCalledWith('12:00');
  });
});
