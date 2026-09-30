import Tts from 'react-native-tts';

export class TextToSpeechService {
  private static queue: string[] = [];
  private static isSpeaking: boolean = false;
  private static initialized: boolean = false;

  private static finishSubscription?: {
    remove: () => void;
  };

  private static cancelSubscription?: {
    remove: () => void;
  };

  static async initialize() {
    if (this.initialized) {
      return;
    }

    await Tts.getInitStatus();
    const voices = await Tts.voices();
    const voice = voices.find(item => item.language.replace(/_/g, '-').toLowerCase() === 'es-us');

    if (!voice) {
      throw new Error('No se encontró la voz es-US');
    }

    await Tts.setDefaultLanguage(voice.language);
    await Tts.setDefaultVoice(voice.id);

    Tts.addEventListener('tts-finish', () => {
      this.isSpeaking = false;

      this.playNext();
    });

    Tts.addEventListener('tts-cancel', () => {
      this.isSpeaking = false;

      this.playNext();
    });

    this.initialized = true;
  }

  static async speak(text: string) {
    const cleanText = text.trim();

    if (!cleanText) {
      return;
    }

    await this.initialize();
    this.queue.push(cleanText);
    this.playNext();
  }

  private static playNext() {
    if (this.isSpeaking) {
      return;
    }

    const nextMessage = this.queue.shift();

    if (!nextMessage) {
      return;
    }

    this.isSpeaking = true;
    Tts.speak(nextMessage);
  }

  static async stop() {
    this.queue = [];
    this.isSpeaking = false;
    await Tts.stop();
  }

  static destroy() {
    this.finishSubscription?.remove();
    this.cancelSubscription?.remove();

    this.queue = [];
    this.isSpeaking = false;
    this.initialized = false;
  }
}
