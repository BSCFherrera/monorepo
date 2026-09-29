import {useCallback, useState} from 'react';
import {AutentikarService, DeviceService} from '@services/index';
import {useOnboardingStore} from '@store/onboarding.store';
import {useAccesRecoveryStore} from '@store/access-recovery.store';

export type AutentikarVerificationStatus = 'idle' | 'starting' | 'verifying' | 'success' | 'error';

const MAX_ATTEMPTS = 2;

interface UseAutentikarVerificationResult {
  status: AutentikarVerificationStatus;
  attempts: number;
  maxAttemptsReached: boolean;
  run: (numeroDocumento: string, deviceId?: string) => Promise<boolean>;
}

/**
 * Orquesta el ciclo completo de verificación de identidad de Autentikar (cédula + rostro): pide
 * el link de sesión al backend (`AutentikarService.startVerification`) y, con él, invoca el
 * módulo nativo (`AutentikarService.authenticate`). Es agnóstico de quién lo use -no navega ni
 * muestra UI propia- para poder reutilizarse en cualquier flujo que necesite exigir una prueba
 * de vida (registro, recuperación de contraseña, verificación de dispositivo, etc.); cada pantalla
 * decide su propia UI y qué hacer al terminar según `status`/`maxAttemptsReached`.
 */
export const useAutentikarVerification = (): UseAutentikarVerificationResult => {
  const [status, setStatus] = useState<AutentikarVerificationStatus>('idle');
  const [attempts, setAttempts] = useState(0);

  const run = useCallback(async (numeroDocumento: string, deviceId?: string): Promise<boolean> => {
    setAttempts(prev => prev + 1);

    if (!AutentikarService.isAvailable()) {
      console.log('[useAutentikarVerification] AutentikarBridge no disponible en esta plataforma');
      setStatus('error');
      return false;
    }

    setStatus('starting');

    try {
      const {link} = await AutentikarService.startVerification(numeroDocumento);
      setStatus('verifying');

      const completed = await AutentikarService.authenticate(link);

      const recoveryType = useAccesRecoveryStore.getState().recoveryType;
      if (recoveryType) {
        setStatus(completed ? 'success' : 'error');
        return completed;
      }

      // Solo si la prueba de vida (cédula + rostro) se completó, se marca el dispositivo como
      // confiable (trust-status = 1). Es un efecto secundario que no debe frenar el flujo: si
      // falla, se registra y se continúa igual.
      if (completed) {
        // `deviceId` explícito (flujo de Login) tiene prioridad; si no viene, se recurre al de
        // `registrationDevice` (flujo de registro, donde el hook lo obtenía originalmente).
        const trustedDeviceId =
          deviceId ?? useOnboardingStore.getState().registrationDevice?.deviceId;
        if (trustedDeviceId) {
          try {
            await DeviceService.updateTrustStatus(trustedDeviceId);
          } catch (trustError) {
            console.log('[useAutentikarVerification] updateTrustStatus error', trustError);
          }
        }
      }

      setStatus(completed ? 'success' : 'error');
      return completed;
    } catch (error) {
      console.log('[useAutentikarVerification] run error', error);
      setStatus('error');
      return false;
    }
  }, []);

  return {
    status,
    attempts,
    maxAttemptsReached: attempts >= MAX_ATTEMPTS,
    run,
  };
};
