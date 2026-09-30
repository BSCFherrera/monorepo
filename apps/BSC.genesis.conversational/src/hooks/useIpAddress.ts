import {useCallback, useEffect, useState} from 'react';
import {DeviceInfoService} from '@services/index';

/**
 * Expone la IP del dispositivo de forma reactiva para cualquier componente.
 * `refresh` permite forzar una relectura (ej. tras un cambio de red).
 */
export const useIpAddress = () => {
  const [ip, setIp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const currentIp = await DeviceInfoService.getIpAddress();
    setIp(currentIp);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {ip, loading, refresh};
};
