import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const LoadingContext = createContext({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
  withLoading: async (fn) => await fn(),
});

export const useLoading = () => useContext(LoadingContext);

/**
 * Intelligent Loading Provider
 * Only shows the loader if the task takes longer than the 'threshold' (200ms)
 * to prevent flickering on fast operations.
 */
export const LoadingProvider = ({ children }) => {
  const [activeTasks, setActiveTasks] = useState(0);
  const [shouldShow, setShouldShow] = useState(false);
  const timerRef = useRef(null);

  const startLoading = useCallback(() => {
    setActiveTasks(prev => prev + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setActiveTasks(prev => Math.max(0, prev - 1));
  }, []);

  const withLoading = useCallback(async (asyncFn) => {
    startLoading();
    try {
      return await asyncFn();
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  // Anti-flicker logic: Only show loader if tasks remain active for > 200ms
  useEffect(() => {
    if (activeTasks > 0) {
      // Clear any existing timer just in case
      if (timerRef.current) clearTimeout(timerRef.current);
      
      timerRef.current = setTimeout(() => {
        setShouldShow(true);
      }, 250); // 250ms threshold - feel free to adjust
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setShouldShow(false);
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeTasks]);

  return (
    <LoadingContext.Provider value={{ isLoading: shouldShow, startLoading, stopLoading, withLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
