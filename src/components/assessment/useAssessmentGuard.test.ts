import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAssessmentGuard } from './useAssessmentGuard';

/** Force document.visibilityState then fire the matching event. */
function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });
  document.dispatchEvent(new Event('visibilitychange'));
}

function blurWindow() {
  window.dispatchEvent(new Event('blur'));
}

afterEach(() => {
  setVisibility('visible');
});

describe('useAssessmentGuard — FR-7 one-sitting lock', () => {
  it('starts at the intro gate', () => {
    const { result } = renderHook(() => useAssessmentGuard());
    expect(result.current.phase).toBe('intro');
  });

  it('start() arms the active phase', () => {
    const { result } = renderHook(() => useAssessmentGuard());
    act(() => result.current.start());
    expect(result.current.phase).toBe('active');
  });

  it('voids the attempt when the tab is hidden while active', () => {
    const { result } = renderHook(() => useAssessmentGuard());
    act(() => result.current.start());
    act(() => setVisibility('hidden'));
    expect(result.current.phase).toBe('voided');
  });

  it('voids the attempt on window blur while active', () => {
    const { result } = renderHook(() => useAssessmentGuard());
    act(() => result.current.start());
    act(() => blurWindow());
    expect(result.current.phase).toBe('voided');
  });

  it('does not void before starting (intro is not guarded)', () => {
    const { result } = renderHook(() => useAssessmentGuard());
    act(() => blurWindow());
    act(() => setVisibility('hidden'));
    expect(result.current.phase).toBe('intro');
  });

  it('stop() disarms the lock so leaving the results screen never voids', () => {
    const { result } = renderHook(() => useAssessmentGuard());
    act(() => result.current.start());
    act(() => result.current.stop());
    act(() => blurWindow());
    act(() => setVisibility('hidden'));
    // Phase stays 'active' (the page tracks `finished` itself); never voided.
    expect(result.current.phase).toBe('active');
  });

  it('reset() returns to the intro gate and disarms the lock', () => {
    const { result } = renderHook(() => useAssessmentGuard());
    act(() => result.current.start());
    act(() => result.current.voidAttempt());
    expect(result.current.phase).toBe('voided');
    act(() => result.current.reset());
    expect(result.current.phase).toBe('intro');
    // After reset, a stray blur does not void.
    act(() => blurWindow());
    expect(result.current.phase).toBe('intro');
  });
});
