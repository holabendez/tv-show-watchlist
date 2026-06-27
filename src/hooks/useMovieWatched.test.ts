import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMovieWatched } from './useMovieWatched';
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

describe('useMovieWatched', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns empty items and not loading when no userId is provided', () => {
    const { result } = renderHook(() => useMovieWatched(undefined));
    
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(onSnapshot).not.toHaveBeenCalled();
  });

  it('subscribes to onSnapshot when userId is provided', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (onSnapshot as any).mockImplementation((_ref: any, callback: any) => {
      callback({
        exists: () => true,
        data: () => ({ items: [{ id: 'test-movie-watched' }] }),
      });
      return vi.fn(); // mock unsubscribe
    });

    const { result } = renderHook(() => useMovieWatched('user-1'));
    
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'movie-watched', 'user-1');
    expect(onSnapshot).toHaveBeenCalled();
    expect(result.current.items).toEqual([{ id: 'test-movie-watched' }]);
    expect(result.current.loading).toBe(false);
  });

  it('adds a watched item and calls setDoc', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (onSnapshot as any).mockImplementation((_ref: any, callback: any) => {
      callback({
        exists: () => true,
        data: () => ({ items: [] }),
      });
      return vi.fn();
    });

    const { result } = renderHook(() => useMovieWatched('user-1'));
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newItem = { id: 'movie-1', movie: { title: 'Movie 1' }, liked: true, watchedAt: 123456 } as any;

    await act(async () => {
      await result.current.addWatchedItem(newItem);
    });

    expect(result.current.items).toEqual([newItem]);
    expect(setDoc).toHaveBeenCalled();
    const setDocArgs = vi.mocked(setDoc).mock.calls[0];
    expect(setDocArgs[1]).toEqual({ items: [newItem] });
    expect(setDocArgs[2]).toEqual({ merge: true });
  });
});
