import RNBlobUtil from 'react-native-blob-util';

import {BscResponse, SignatureDocumentResponseData} from '@/types/index';
import {SIGNATURE_DOCUMENT_BASE64} from './signatureDocument.base64';

const MOCK_DELAY_MS = 1000;
const SIGNATURE_DOCUMENT_FILE_NAME = 'convenio_unico_ejemplo.pdf';

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * react-native-pdf necesita una ruta real de archivo (file://). Un PDF cargado con require()
 * pasa por el pipeline de assets de Metro, que en Android empaqueta binarios no-imagen como
 * recurso "raw" (ni URL http ni ruta de archivo real), y eso producía "open failed: ENOENT" al
 * previsualizar. Por eso el PDF de prueba se guarda en base64 y se escribe directo al cache,
 * igual que DocumentService.fetchReal hace con el binario que llega del backend real.
 */
const cacheSignatureDocumentAsset = async (): Promise<string> => {
  const destinationPath = `${RNBlobUtil.fs.dirs.CacheDir}/${SIGNATURE_DOCUMENT_FILE_NAME}`;

  // Siempre se reescribe: evita quedar pegado a una versión previa corrupta o vacía en el cache
  await RNBlobUtil.fs.writeFile(destinationPath, SIGNATURE_DOCUMENT_BASE64, 'base64');

  return destinationPath;
};

export const DOCUMENT_MOCK = {
  /**
   * Simula la petición del documento de firma, cacheando el PDF de prueba en una ruta file://
   * real para que react-native-pdf pueda abrirlo.
   */
  getSignatureDocument: async (): Promise<BscResponse<SignatureDocumentResponseData>> => {
    await delay(MOCK_DELAY_MS);
    const destinationPath = await cacheSignatureDocumentAsset();

    return {
      bscResponse: {
        headers: {
          statusCode: 200,
          reasonPhrase: 'OK',
        },
        content: {
          data: {
            localUri: `file://${destinationPath}`,
            fileName: SIGNATURE_DOCUMENT_FILE_NAME,
          },
        },
      },
    };
  },
};
