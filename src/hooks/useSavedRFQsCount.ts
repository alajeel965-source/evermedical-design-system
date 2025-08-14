import { useState, useEffect } from 'react';

// Helper hook to fetch saved RFQs count for badge
export function useSavedRFQsCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // TODO: Replace with actual Supabase query when RFQ saving is implemented
    // For now, return mock data
    const mockCount = Math.floor(Math.random() * 15); // Random count 0-14
    setCount(mockCount);
  }, []);

  // Cap at 99+ for UI purposes
  const displayCount = count > 99 ? '99+' : count.toString();
  
  return { count, displayCount, hasCount: count > 0 };
}