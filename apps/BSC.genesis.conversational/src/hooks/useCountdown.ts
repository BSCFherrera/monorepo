import {useEffect, useState} from 'react';

/**
 * Cuenta regresiva en formato mm:ss. Se reinicia cada vez que "resendTrigger" cambia
 */
export const useCountdown = (resendTrigger: number, initialSeconds: number) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (resendTrigger === 0) {
      return;
    }
    setSeconds(initialSeconds);
    const interval = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTrigger, initialSeconds]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const label = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

  return {label, finished: seconds === 0};
};
