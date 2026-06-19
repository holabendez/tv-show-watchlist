import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWatched } from './useWatched';
import { onSnapshot, setDoc, doc } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => {
  return {
    doc: vi.fn(),
    onSnapshot: vi.fn(),
    setDoc: vi.fn(),
    getFirestore: vi.fn(() => ({})),
  };
});

vi.mock('../services/firebase', () => ({
  db: {},
}));

describe('useWatched', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty items and not loading when no userId is provided', () => {
    const { result } = renderHook(() => useWatched(undefined));
    
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(onSnapshot).not.toHaveBeenCalled();
  });

  it('subscribes to onSnapshot when userId is provided', () => {
    (onSnapshot as any).mockImplementation((_ref: any, callback: any) => {
      callback({
        exists: () => true,
        data: () => ({ items: [{ id: 'test-watched-1' }] }),
      });
      return vi.fn(); // mock unsubscribe
    });

    const { result } = renderHook(() => useWatched('user-1'));
    
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'watched', 'user-1');
    expect(onSnapshot).toHaveBeenCalled();
    expect(result.current.items).toEqual([{ id: 'test-watched-1' }]);
    expect(result.current.loading).toBe(false);
  });

  it('adds a watched item optimistically and calls setDoc', async () => {
    (onSnapshot as any).mockImplementation((_ref: any, callback: any) => {
      callback({
        exists: () => true,
        data: () => ({ items: [] }),
      });
      return vi.fn(); // mock unsubscribe
    });

    const { result } = renderHook(() => useWatched('user-1'));
    
    const newItem = {
      id: 'test-id',
      show: { id: 1, name: 'Test Show' },
      season: { id: 101, name: 'Season 1' },
      providers: null,
      liked: true,
      watchedAt: 1234567890
    } as any;

    await act(async () => {
      await result.current.addWatchedItem(newItem);
    });

    // Optimistically updated
    expect(result.current.items).toEqual([newItem]);
    
    // Firestore setDoc called
    expect(setDoc).toHaveBeenCalled();
    const setDocArgs = vi.mocked(setDoc).mock.calls[0];
    expect(setDocArgs[1]).toEqual({ items: [newItem] });
    expect(setDocArgs[2]).toEqual({ merge: true });
  });
});
