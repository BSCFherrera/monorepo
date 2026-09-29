import {Linking} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

/**
 * Copia el número mostrado y abre la app de llamadas del dispositivo con el número precargado
 * (no marca automáticamente). Si el dispositivo no tiene app de llamadas (ej. tablet/emulador),
 * el número queda copiado de todas formas.
 */
export const callPhoneNumber = async (label: string, url: string): Promise<void> => {
  Clipboard.setString(label);
  try {
    await Linking.openURL(url);
  } catch {
    // Sin app de llamadas disponible: el número ya quedó copiado.
  }
};

/** Abre el cliente de correo del dispositivo con el destinatario precargado. */
export const sendEmail = async (url: string): Promise<void> => {
  try {
    await Linking.openURL(url);
  } catch {
    // Sin cliente de correo configurado en el dispositivo.
  }
};

/** Abre un sitio web externo en el navegador del dispositivo. */
export const openExternalWebsite = async (url: string): Promise<void> => {
  try {
    await Linking.openURL(url);
  } catch {
    // Sin navegador disponible para abrir el enlace.
  }
};
