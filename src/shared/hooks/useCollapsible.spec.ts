import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCollapsible } from './useCollapsible';

describe('useCollapsible', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts collapsed', () => {
    const { result } = renderHook(() => useCollapsible());
    expect(result.current.isExpanded).toBe(false);
  });

  it('expands on toggle', () => {
    const { result } = renderHook(() => useCollapsible());
    act(() => result.current.toggle());
    expect(result.current.isExpanded).toBe(true);
  });

  it('collapses on second toggle', () => {
    const { result } = renderHook(() => useCollapsible());
    act(() => result.current.toggle());
    act(() => result.current.toggle());
    expect(result.current.isExpanded).toBe(false);
  });

  it('expands via expand()', () => {
    const { result } = renderHook(() => useCollapsible());
    act(() => result.current.expand());
    expect(result.current.isExpanded).toBe(true);
  });

  it('collapses via collapse()', () => {
    const { result } = renderHook(() => useCollapsible());
    act(() => result.current.expand());
    act(() => result.current.collapse());
    expect(result.current.isExpanded).toBe(false);
  });

  it('provides a containerRef', () => {
    const { result } = renderHook(() => useCollapsible());
    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull();
  });

  it('collapses on outside click when expanded and ref is attached', () => {
    const { result } = renderHook(() => useCollapsible());

    // Attach a container element to the ref
    const container = document.createElement('div');
    document.body.appendChild(container);
    Object.defineProperty(result.current.containerRef, 'current', { value: container, writable: true });

    act(() => result.current.expand());
    expect(result.current.isExpanded).toBe(true);

    // Simulate outside click (not inside container)
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    act(() => {
      outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(result.current.isExpanded).toBe(false);

    document.body.removeChild(container);
    document.body.removeChild(outside);
  });

  it('does not register click handler when collapsed', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    renderHook(() => useCollapsible());
    // Should not have added mousedown listener since collapsed by default
    const mousedownCalls = addSpy.mock.calls.filter(([event]) => event === 'mousedown');
    expect(mousedownCalls.length).toBe(0);
  });
});
