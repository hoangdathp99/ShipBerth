import { useEffect } from 'react';

const useDailyDateUpdate = (setDateBerth: (val: string) => void) => {
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const day = now.getDate();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      setDateBerth(`${day} tháng ${month} năm ${year}`);
    };

    updateDate(); // Gọi lần đầu

    const scheduleNextUpdate = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // Set mốc 00:00:00 ngày hôm sau

      const timeToMidnight = tomorrow.getTime() - now.getTime();

      return setTimeout(() => {
        updateDate();
        timerId = scheduleNextUpdate(); // Lặp lại sau khi đã cập nhật
      }, timeToMidnight);
    };

    let timerId = scheduleNextUpdate();

    return () => {
      clearTimeout(timerId); // Cleanup khi unmount
    };
  }, [setDateBerth]);
};
export default useDailyDateUpdate;
