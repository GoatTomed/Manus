/**
 * Hook pour gérer le compteur de clés en localStorage
 */

const KEY_COUNTER_STORAGE = "yousuck_key_counter";

export function useKeyCounter() {
  const getCount = (): number => {
    const stored = localStorage.getItem(KEY_COUNTER_STORAGE);
    return stored ? parseInt(stored, 10) : 0;
  };

  const addKey = (amount: number = 1): number => {
    const current = getCount();
    const newCount = current + amount;
    localStorage.setItem(KEY_COUNTER_STORAGE, newCount.toString());
    return newCount;
  };

  const consumeKey = (): boolean => {
    const current = getCount();
    if (current <= 0) return false;
    const newCount = current - 1;
    localStorage.setItem(KEY_COUNTER_STORAGE, newCount.toString());
    return true;
  };

  const resetCounter = (): void => {
    localStorage.removeItem(KEY_COUNTER_STORAGE);
  };

  return { getCount, addKey, consumeKey, resetCounter };
}
