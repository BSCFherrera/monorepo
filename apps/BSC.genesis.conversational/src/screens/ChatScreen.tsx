import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Animated,
  Image,
  View,
  FlatList,
  Keyboard,
  Platform,
  PermissionsAndroid,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice, {SpeechErrorEvent, SpeechResultsEvent} from '@react-native-voice/voice';
import Icon from '@react-native-vector-icons/feather';
import {useTranslation} from 'react-i18next';
import {BankHeader, HamburgerMenu, MessageBubble, TypingIndicator} from '@components/index';
import {useChat} from '@hooks/useChat';
import {useKeyboardOffset} from '@hooks/useKeyboardOffset';
import {useAuthStore} from '@store/auth.store';
import {formatName} from '@utils/helpers';
import {ChatOption, Message, RootStackParamList} from '@/types/index';
import {BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';
import {AuthService} from '@services/index';
import {TextToSpeechService} from '@services/text-to-speech.service';
import {APP_CONFIG} from '@constants/config';

type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Bandera persistida por dispositivo cuando se confirma que no tiene motor de
// reconocimiento de voz funcional (ej: Huawei sin Google Mobile Services)
const VOICE_UNSUPPORTED_STORAGE_KEY = '@bsc_voice_unsupported';
// Cantidad de fallos "error 5" (ERROR_CLIENT) consecutivos y sin transcripción
// exitosa que se toleran antes de asumir que el dispositivo no soporta voz
const MAX_CONSECUTIVE_CLIENT_ERRORS = 2;

export const ChatScreen: React.FC = () => {
  const route = useRoute<ChatRouteProp>();
  const {t} = useTranslation('chat');
  const {messages, isConnected, isTyping, sendMessage} = useChat();
  const firstName = useAuthStore(state => state.user?.primerNombre);
  const keyboardOffset = useKeyboardOffset();
  const [inputValue, setInputValue] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(true);
  const isManualStopRef = useRef(false);
  const hasTranscriptRef = useRef(false);
  const clientErrorCountRef = useRef(0);
  // Texto ya presente en el input al iniciar la sesión de voz. En iOS
  // onSpeechResults dispara varias veces con el transcript acumulado (no el
  // delta), así que cada resultado reemplaza desde esta base y no se concatena.
  const voiceBaseTextRef = useRef('');
  // true mientras el texto actual del input provenga del reconocimiento de voz
  // y el usuario no lo haya editado manualmente desde entonces
  const isVoiceInputRef = useRef(false);
  // Bloquea taps repetidos mientras una operación de voz (start/stop) está en
  // curso: evita que un segundo toque, disparado antes de que llegue el
  // callback nativo, reingrese a la misma acción y corrompa la sesión
  const isVoiceActionPendingRef = useRef(false);
  // Evita reintentar el fallback más de una vez por sesión de voz: se resetea
  // al iniciar cada nueva escucha desde handleVoicePress
  const hasRetriedFallbackRef = useRef(false);
  const flatListRef = useRef<FlatList>(null);
  const rootNavigation = useNavigation<RootNavigationProp>();
  const listeningOpacity = useRef(new Animated.Value(1)).current;
  const lastSpokenMessageRef = useRef<string | null>(null);

  const quickActions = useMemo(
    () => [
      t('quickActions.transfer'),
      t('quickActions.transactions'),
      t('quickActions.products'),
      t('quickActions.profile'),
    ],
    [t],
  );

  const invertedMessages = useMemo(() => [...messages].reverse(), [messages]);

  useEffect(() => {
    if (!APP_CONFIG.TTS_ENABLED) {
      return;
    }

    if (messages.length === 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage.sender !== 'bot' ||
      lastMessage.type === 'error' ||
      lastSpokenMessageRef.current === lastMessage.id
    ) {
      return;
    }

    lastSpokenMessageRef.current = lastMessage.id;
    TextToSpeechService.speak(lastMessage.content);
  }, [messages]);

  const scrollToLatest = () => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({offset: 0, animated: true});
    });
  };

  useEffect(() => {
    if (route.params?.prefillMessage) {
      sendMessage(route.params.prefillMessage);
      rootNavigation.setParams({prefillMessage: undefined});
      scrollToLatest();
    }
  }, [route.params?.prefillMessage, sendMessage, rootNavigation]);

  useEffect(() => {
    let isMounted = true;

    const checkVoiceAvailability = async () => {
      try {
        const persistedUnsupported = await AsyncStorage.getItem(VOICE_UNSUPPORTED_STORAGE_KEY);

        if (persistedUnsupported === 'true') {
          if (isMounted) {
            setIsVoiceSupported(false);
          }
          return;
        }

        const available = await Voice.isAvailable();

        if (!available && isMounted) {
          setIsVoiceSupported(false);
          await AsyncStorage.setItem(VOICE_UNSUPPORTED_STORAGE_KEY, 'true');
        }
      } catch {
        // Si la verificación falla no asumimos incapacidad total: puede ser un
        // error transitorio de AsyncStorage/Voice y no un problema del dispositivo
      }
    };

    checkVoiceAvailability();
    TextToSpeechService.initialize();

    return () => {
      isMounted = false;
      TextToSpeechService.destroy();
    };
  }, []);

  useEffect(() => {
    if (!isListening) {
      listeningOpacity.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(listeningOpacity, {
          toValue: 0.35,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(listeningOpacity, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();

    return () => {
      pulse.stop();
      listeningOpacity.setValue(1);
    };
  }, [isListening, listeningOpacity]);

  useEffect(() => {
    Voice.onSpeechStart = () => {
      isManualStopRef.current = false;
      hasTranscriptRef.current = false;
      setIsListening(true);
    };

    Voice.onSpeechEnd = () => {
      isManualStopRef.current = false;
      setIsListening(false);
    };

    Voice.onSpeechResults = (event: SpeechResultsEvent) => {
      const transcript = event.value?.[0]?.trim();

      if (!transcript) {
        return;
      }

      hasTranscriptRef.current = true;
      // Una transcripción exitosa confirma que el motor de voz sí funciona en
      // este dispositivo, así que cualquier "error 5" previo fue transitorio
      clientErrorCountRef.current = 0;
      isVoiceInputRef.current = true;
      const prefix = voiceBaseTextRef.current;
      setInputValue(prefix ? `${prefix} ${transcript}` : transcript);
    };

    Voice.onSpeechError = (event: SpeechErrorEvent) => {
      const rawCode = String(event.error?.code ?? '').toLowerCase();
      const rawMessage = String(event.error?.message ?? '').toLowerCase();

      // "error 5" (ERROR_CLIENT) suele significar que el motor por defecto del
      // sistema no resolvió bien (frecuente cuando el paquete no queda visible
      // para PackageManager o el reconocedor predeterminado no es el de Google).
      // "error 12/13" (LANGUAGE_NOT_SUPPORTED / LANGUAGE_UNAVAILABLE, Android 13+)
      // significa que el locale regional 'es-DO' no está disponible en ese motor.
      // En ambos casos, antes de rendirnos, reintentamos UNA vez forzando el
      // motor de Google explícito con un locale español genérico.
      const isRetryableSetupError =
        rawCode === '5' ||
        rawCode === '12' ||
        rawCode === '13' ||
        rawMessage.includes('error 5') ||
        rawMessage.includes('error 12') ||
        rawMessage.includes('error 13');

      if (isRetryableSetupError && !hasTranscriptRef.current && !hasRetriedFallbackRef.current) {
        hasRetriedFallbackRef.current = true;

        Voice.start('es-419', {RECOGNIZER_ENGINE: 'GOOGLE'}).catch((fallbackError: unknown) => {
          setIsListening(false);
          const fallbackDetail =
            fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
          Alert.alert(
            t('voice.errorTitle'),
            `${t('voice.errorMessage')}\n\n[Debug] fallback GOOGLE/es-419: ${fallbackDetail}`,
          );
        });

        return;
      }

      setIsListening(false);

      const benignErrorTokens = [
        'no match',
        "didn't understand",
        'speech timeout',
        'recognizer busy',
        'recognitionservice busy',
        'error 5',
        'error 6',
        'error 7',
      ];

      const isBenignError =
        benignErrorTokens.some(token => rawMessage.includes(token) || rawCode.includes(token)) ||
        rawCode === '5' ||
        rawCode === '6' ||
        rawCode === '7';

      // "error 5" (ERROR_CLIENT) repetido —ahora incluso tras el reintento con
      // motor Google explícito— y sin ninguna transcripción exitosa es la firma
      // típica de un dispositivo sin motor de reconocimiento de voz funcional
      // (frecuente en Huawei sin Google Mobile Services)
      const isClientSideError = rawCode === '5' || rawMessage.includes('error 5');

      if (isClientSideError && !hasTranscriptRef.current) {
        clientErrorCountRef.current += 1;

        if (clientErrorCountRef.current >= MAX_CONSECUTIVE_CLIENT_ERRORS) {
          setIsVoiceSupported(false);
          AsyncStorage.setItem(VOICE_UNSUPPORTED_STORAGE_KEY, 'true').catch(() => undefined);
        }
      }

      if (isManualStopRef.current || hasTranscriptRef.current || isBenignError) {
        isManualStopRef.current = false;
        return;
      }

      Alert.alert(
        t('voice.errorTitle'),
        `${t('voice.errorMessage')}\n\n[Debug] code: ${rawCode || 'N/A'} · message: ${
          rawMessage || 'N/A'
        }`,
      );
    };

    return () => {
      Voice.destroy().finally(() => Voice.removeAllListeners());
    };
  }, [t]);

  const handleInputChange = (text: string) => {
    // Cualquier edición manual invalida el origen "voz" del texto actual
    isVoiceInputRef.current = false;
    setInputValue(text);
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue, isVoiceInputRef.current);
      setInputValue('');
      isVoiceInputRef.current = false;
      scrollToLatest();
    }
  };

  const handleOptionSelection = (option: ChatOption) => {
    if (!option.ref) {
      return;
    }

    sendMessage(`${option.label} ${option.ref}`);
    scrollToLatest();
  };

  const ensureMicrophonePermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
      title: t('voice.permissionTitle'),
      message: t('voice.permissionMessage'),
      buttonPositive: t('voice.permissionPositive'),
      buttonNegative: t('voice.permissionNegative'),
    });

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const handleVoicePress = async () => {
    // Ignora taps mientras ya hay un start/stop en curso (ver comentario del ref)
    if (isVoiceActionPendingRef.current) {
      return;
    }

    if (isListening) {
      isVoiceActionPendingRef.current = true;
      isManualStopRef.current = true;
      // Actualización optimista: no esperamos a onSpeechEnd (poco confiable tras
      // Voice.stop() en algunos Android/OEM) para reflejar que ya se detuvo.
      // Así el botón nunca queda "atascado" en escucha esperando un segundo tap.
      setIsListening(false);

      try {
        await Voice.stop();
      } catch {
        // La UI ya refleja "detenido"; un fallo del stop nativo aquí es best-effort
      } finally {
        isVoiceActionPendingRef.current = false;
      }

      return;
    }

    isVoiceActionPendingRef.current = true;

    try {
      const hasPermission = await ensureMicrophonePermission();

      if (!hasPermission) {
        Alert.alert(t('voice.permissionDeniedTitle'), t('voice.permissionDeniedMessage'));
        return;
      }

      // Congelar el texto actual aquí (no en onSpeechStart): iOS puede
      // re-disparar onSpeechStart a mitad de sesión y recapturaría el parcial.
      voiceBaseTextRef.current = inputValue.trim();
      hasRetriedFallbackRef.current = false;
      Keyboard.dismiss();
      await Voice.start('es-DO');
    } catch (startError) {
      setIsListening(false);
      const startDetail = startError instanceof Error ? startError.message : String(startError);
      Alert.alert(
        t('voice.errorTitle'),
        `${t('voice.errorMessage')}\n\n[Debug] Voice.start: ${startDetail}`,
      );
    } finally {
      isVoiceActionPendingRef.current = false;
    }
  };

  const renderOptionCards = (options: ChatOption[] | undefined) => {
    const safeOptions = Array.isArray(options) ? options : [];

    if (safeOptions.length === 0) {
      return null;
    }

    return (
      <View style={styles.optionCardList}>
        {safeOptions.map((option, index) => (
          <TouchableOpacity
            key={`${option.ref}-${index}`}
            style={styles.optionRow}
            onPress={() => handleOptionSelection(option)}>
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.optionMeta}>
                {[option.product_type, option.currency].filter(Boolean).join(' · ')}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderMessage = ({item}: {item: Message}) => {
    const isBot = item.sender === 'bot';
    const options = Array.isArray(item.metadata?.options) ? item.metadata?.options : [];

    if (!isBot) {
      return <MessageBubble message={item} />;
    }

    return (
      <View style={styles.messageRowBot}>
        <Image source={require('@assets/bsc-icon.png')} style={styles.assistantAvatar} />
        <View style={styles.botBubbleWrapper}>
          <MessageBubble message={item} />
          {renderOptionCards(options)}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BankHeader
        title={t('screen.title')}
        onMenuPress={() => setMenuVisible(true)}
        onNotificationPress={() => {
          sendMessage(t('screen.showNotificationsMessage'));
          scrollToLatest();
        }}
        onProfilePress={() => rootNavigation.navigate('Profile')}
      />
      <Animated.View style={[styles.keyboardView, {paddingBottom: keyboardOffset}]}>
        <FlatList
          ref={flatListRef}
          style={styles.messageListContainer}
          inverted
          data={invertedMessages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          ListHeaderComponent={isTyping ? <TypingIndicator /> : undefined}
          ListFooterComponent={
            <View style={styles.topSection}>
              <View style={styles.heroCard}>
                <Image
                  source={require('@assets/bsc-logo.png')}
                  style={styles.heroLogo}
                  resizeMode="contain"
                />
                <View style={styles.heroTextWrap}>
                  <Text style={styles.heroTitle}>
                    {t('screen.greeting', {
                      name: firstName ? formatName(firstName) : t('screen.defaultCustomer'),
                    })}
                  </Text>
                  <Text style={styles.heroSubtitle}>{t('screen.heroSubtitle')}</Text>
                </View>
              </View>

              <View style={styles.connectionPill}>
                <Text style={styles.connectionText}>
                  {isConnected ? t('screen.connectedStatus') : t('screen.demoStatus')}
                </Text>
              </View>

              <View style={styles.quickActionsGrid}>
                {quickActions.map(action => (
                  <TouchableOpacity
                    key={action}
                    style={styles.quickActionButton}
                    onPress={() => {
                      sendMessage(action);
                      scrollToLatest();
                    }}>
                    <Text style={styles.quickActionText}>{action}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
        <View style={styles.inputContainer}>
          {isListening ? (
            <View style={styles.listeningIndicator}>
              <Icon name="mic" size={16} color={COLORS.primary} />
              <Animated.Text style={[styles.listeningText, {opacity: listeningOpacity}]}>
                {t('voice.listening')}
              </Animated.Text>
            </View>
          ) : (
            <TextInput
              value={inputValue}
              onChangeText={handleInputChange}
              onFocus={scrollToLatest}
              placeholder={t('screen.placeholder')}
              placeholderTextColor={COLORS.textDisabled}
              style={styles.input}
              multiline
              autoCorrect={false}
            />
          )}
          {isVoiceSupported && (
            <TouchableOpacity
              style={[styles.voiceButton, isListening ? styles.voiceButtonListening : null]}
              onPress={handleVoicePress}
              activeOpacity={0.85}>
              <Icon
                name={isListening ? 'mic-off' : 'mic'}
                size={20}
                color={isListening ? COLORS.textLight : COLORS.primary}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.sendButtonActive, isListening ? styles.sendButtonDisabled : null]}
            onPress={handleSend}
            activeOpacity={0.85}
            disabled={isListening}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <HamburgerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        currentRoute="Chat"
        onNavigate={routeName => rootNavigation.navigate(routeName)}
        onOpenHistory={history =>
          rootNavigation.navigate('Chat', {
            prefillMessage: t('screen.openHistoryMessage', {title: history.title}),
          })
        }
        onLogout={() => AuthService.logout()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  // Sin `flex: 1` explícito, el FlatList (dentro del `KeyboardAvoidingView`, junto al
  // `inputContainer`) no reserva su espacio dentro del layout flex y no se reduce
  // correctamente cuando el teclado empuja el contenido hacia arriba.
  messageListContainer: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },
  connectionPill: {
    alignSelf: 'center',
    backgroundColor: '#E8EDF8',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    marginBottom: SPACING.md,
  },
  connectionText: {
    color: '#4B5D78',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  messageList: {
    paddingVertical: SPACING.md,
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: SPACING.xs,
  },
  topSection: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#ECF3FE',
    borderWidth: 1,
    borderColor: '#DCE8FA',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  heroLogo: {
    width: 42,
    height: 42,
    marginRight: SPACING.sm,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    color: '#10223D',
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  heroSubtitle: {
    color: '#5C6D88',
    marginTop: 2,
    fontSize: FONT_SIZES.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: SPACING.sm,
  },
  quickActionButton: {
    width: '48.5%',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#DFE8F5',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  quickActionText: {
    color: '#1D2D47',
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: FONT_SIZES.sm,
    lineHeight: 18,
  },
  messageRowBot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
  },
  botBubbleWrapper: {
    flex: 1,
    marginRight: SPACING.md,
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: SPACING.md,
    marginRight: SPACING.xs,
    marginBottom: SPACING.md,
  },
  optionCardList: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.lg,
    marginLeft: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E6ECF5',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F6',
  },
  optionTextWrap: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  optionLabel: {
    color: '#182030',
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.md,
  },
  optionMeta: {
    color: '#61708A',
    marginTop: 2,
    fontSize: FONT_SIZES.sm,
  },
  arrow: {
    color: '#8591A7',
    fontSize: 32,
  },
  inputContainer: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E8EDF4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 52,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F3',
    backgroundColor: '#FBFCFF',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    color: '#172033',
    fontSize: FONT_SIZES.lg,
  },
  listeningIndicator: {
    flex: 1,
    minHeight: 52,
    maxHeight: 110,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  listeningText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  sendButtonActive: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  voiceButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonListening: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  sendIcon: {
    color: COLORS.textLight,
    fontSize: 20,
    marginLeft: 2,
  },
});
