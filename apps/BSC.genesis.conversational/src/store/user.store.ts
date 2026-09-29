import {create} from 'zustand';

interface UserPreferences {
  /** Indica si el usuario tiene la autenticación biométrica habilitada */
  biometryEnabled: boolean;
}

interface UserState {
  preferences: UserPreferences;
  setBiometryEnabled: (enabled: boolean) => void;
}

/**
 * Store global del usuario (Zustand)
 */
export const useUserStore = create<UserState>(set => ({
  preferences: {
    biometryEnabled: false,
  },
  setBiometryEnabled: enabled =>
    set(state => ({preferences: {...state.preferences, biometryEnabled: enabled}})),
}));
