// src/hooks/useLocalStorage.ts - 改进的 localStorage hook

import { useState, useEffect, useCallback } from 'react';

interface UseLocalStorageOptions<T> {
  /** 序列化函数 */
  serialize?: (value: T) => string;
  /** 反序列化函数 */
  deserialize?: (value: string) => T;
  /** 错误处理回调 */
  onError?: (error: Error) => void;
}

/**
 * 增强的 localStorage hook，支持类型安全和错误处理
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError
  } = options;

  // 初始化状态
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      onError?.(error as Error);
      return initialValue;
    }
  });

  // 更新值
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, serialize(valueToStore));
    } catch (error) {
      onError?.(error as Error);
    }
  }, [key, serialize, storedValue, onError]);

  // 删除值
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [key, initialValue, onError]);

  // 监听其他标签页的变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(deserialize(e.newValue));
        } catch (error) {
          onError?.(error as Error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize, onError]);

  return [storedValue, setValue, removeValue];
}
