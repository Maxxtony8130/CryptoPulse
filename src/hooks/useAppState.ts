import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * Subscribe to app state changes (active / background / inactive).
 */
export function useAppState(callback: (state: AppStateStatus) => void) {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', callback);
    return () => subscription.remove();
  }, [callback]);
}
