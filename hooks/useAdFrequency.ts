// hooks/useAdFrequency.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef } from 'react';

import { AD_INTERVAL_MS, LAST_AD_TIME_KEY } from '@/constants/ads';
import { showAd } from '@/services/adService';

export const useAdFrequency = () => {
  const lastAdTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Lấy thời gian lần cuối show ad khi app mở lại
  useEffect(() => {
    const loadLastAdTime = async () => {
      try {
        const value = await AsyncStorage.getItem(LAST_AD_TIME_KEY);
        if (value) {
          lastAdTimeRef.current = Number(value);
        }
      } catch (e) {
        console.log('Error loading last ad time', e);
      }
    };

    loadLastAdTime();
  }, []);

  const updateLastAdTime = useCallback(async (time: number) => {
    lastAdTimeRef.current = time;
    try {
      await AsyncStorage.setItem(LAST_AD_TIME_KEY, String(time));
    } catch (e) {
      console.log('Error saving last ad time', e);
    }
  }, []);

  // Hàm kiểm tra có được phép show ad không
  const canShowAdNow = useCallback(() => {
    const now = Date.now();
    const last = lastAdTimeRef.current;

    if (!last) return true; // chưa từng show lần nào

    return now - last >= AD_INTERVAL_MS;
  }, []);

  // Hàm bạn gọi mỗi khi muốn thử show ad
  const tryShowAd = useCallback(async () => {
    if (!canShowAdNow()) return;

    await showAd();
    await updateLastAdTime(Date.now());
  }, [canShowAdNow, updateLastAdTime]);

  // Auto spam: 5p gọi 1 lần
  const startAdSpam = useCallback(() => {
    if (intervalRef.current) return; // tránh tạo 2 interval

    intervalRef.current = setInterval(() => {
      tryShowAd();
    }, AD_INTERVAL_MS);
  }, [tryShowAd]);

  const stopAdSpam = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Dọn dẹp khi unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    tryShowAd,   // gọi tay theo event (vd: sau 1 màn chơi)
    startAdSpam, // auto: 5p gọi 1 lần
    stopAdSpam,
  };
};
