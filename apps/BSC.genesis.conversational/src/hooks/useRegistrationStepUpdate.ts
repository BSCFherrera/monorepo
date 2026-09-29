import {useCallback, useState} from 'react';
import {RegistrationStepService} from '@services/index';
import {useOnboardingStore} from '@store/index';
import {RegistrationStepName} from '@/types/index';

interface UseRegistrationStepUpdateResult {
  isServiceErrorModalOpen: boolean;
  closeServiceErrorModal: () => void;
  updateRegistrationStep: (stepName: RegistrationStepName) => Promise<boolean>;
}

/**
 * Encapsula la llamada a `RegistrationStepService.updateStep` y su manejo de error, para que
 * cada vista del flujo de registro solo tenga que invocarla con el `stepName` correspondiente.
 * El éxito o fallo de la llamada es independiente de la función que la invoque: ante un error
 * expone `isServiceErrorModalOpen` para mostrar el modal genérico de error de servicio.
 */
export const useRegistrationStepUpdate = (logTag: string): UseRegistrationStepUpdateResult => {
  const setRegistrationStep = useOnboardingStore(state => state.setRegistrationStep);
  const [isServiceErrorModalOpen, setIsServiceErrorModalOpen] = useState(false);

  const updateRegistrationStep = useCallback(
    async (stepName: RegistrationStepName): Promise<boolean> => {
      try {
        const step = await RegistrationStepService.updateStep(stepName);
        setRegistrationStep(step);
        return true;
      } catch (error) {
        console.log(`[${logTag}] RegistrationStepService.updateStep error`, error);
        setIsServiceErrorModalOpen(true);
        return false;
      }
    },
    [logTag, setRegistrationStep],
  );

  return {
    isServiceErrorModalOpen,
    closeServiceErrorModal: () => setIsServiceErrorModalOpen(false),
    updateRegistrationStep,
  };
};
