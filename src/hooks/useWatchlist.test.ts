import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWatchlist } from './useWatchlist';
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

describe('useWatchlist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock alert since it's used for error handling
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns empty items and not loading when no userId is provided', () => {
    const { result } = renderHook(() => useWatchlist(undefined));
    
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(onSnapshot).not.toHaveBeenCalled();
  });

  it('subscribes to onSnapshot when userId is provided', () => {
    (onSnapshot as any).mockImplementation((_ref: any, callback: any) => {
      callback({
        exists: () => true,
        data: () => ({ items: [{ id: 'test-item-1' }] }),
      });
      return vi.fn(); // mock unsubscribe
    });

    const { result } = renderHook(() => useWatchlist('user-1'));
    
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'watchlists', 'user-1');
    expect(onSnapshot).toHaveBeenCalled();
    expect(result.current.items).toEqual([{ id: 'test-item-1' }]);
    expect(result.current.loading).toBe(false);
  });

  it('handles permission denied errors in onSnapshot gracefully', () => {
    (onSnapshot as any).mockImplementation((_ref: any, _callback: any, errorCallback: any) => {
      errorCallback({ code: 'permission-denied' });
      return vi.fn();
    });

    const { result } = renderHook(() => useWatchlist('user-1'));
    
    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Could not load watchlist due to database permission issues.'));
    expect(result.current.loading).toBe(false);
  });

  it('updates the watchlist directly and calls setDoc', async () => {
    (onSnapshot as any).mockImplementation((_ref: any, callback: any) => {
      callback({
        exists: () => true,
        data: () => ({ items: [] }),
      });
      return vi.fn();
    });

    const { result } = renderHook(() => useWatchlist('user-1'));
    
    const newItems = [
      { id: 'item-1', show: { name: 'Show 1' }, season: { name: 'Season 1' } } as any
    ];

    await act(async () => {
      await result.current.updateWatchlist(newItems);
    });

    expect(result.current.items).toEqual(newItems);
    expect(setDoc).toHaveBeenCalled();
    const setDocArgs = vi.mocked(setDoc).mock.calls[0];
    expect(setDocArgs[1]).toEqual({ items: newItems });
  });

  it('updates the watchlist using a functional update', async () => {
    let internalState: any[] = [];
    (onSnapshot as any).mockImplementation((_ref: any, callback: any) => {
      callback({
        exists: () => true,
        data: () => ({ items: internalState }),
      });
      return vi.fn();
    });

    const { result } = renderHook(() => useWatchlist('user-1'));
    
    const newItem = { id: 'item-2', show: { name: 'Show 2' }, season: { name: 'Season 2' } } as any;

    await act(async () => {
      await result.current.updateWatchlist((prev) => [...prev, newItem]);
    });

    expect(result.current.items).toEqual([newItem]);
    expect(setDoc).toHaveBeenCalled();
  });
});
