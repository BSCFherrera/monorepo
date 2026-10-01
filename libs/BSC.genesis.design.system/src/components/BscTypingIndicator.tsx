import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing } from '../theme/spacing';

export interface BscTypingIndicatorProps {
  label?: string;
  animated?: boolean;
  /**
   * `inline` (por defecto): solo los puntos, para colocarlos donde se necesiten.
   * `bubble`: los puntos dentro de una burbuja de mensaje recibido (mismos tokens que la
   * entrante de `BscMessageBubble`), para anunciar en el hilo de un chat que la otra parte
   * está respondiendo.
   */
  variant?: 'inline' | 'bubble';
  testID?: string;
}

export function useReducedMotionEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setEnabled).catch(() => setEnabled(false));
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setEnabled);
    return () => subscription.remove();
  }, []);

  return enabled;
}

export function startTypingIndicatorAnimations(values: readonly Animated.Value[]): () => void {
  const animations = values.map((value, index) =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(index * 120),
        Animated.timing(value, {
          toValue: 1,
          duration: 260,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 260,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ),
  );

  animations.forEach(animation => animation.start());
  return () => animations.forEach(animation => animation.stop());
}

export function BscTypingIndicator({
  label = 'Typing',
  animated = true,
  variant = 'inline',
  testID,
}: BscTypingIndicatorProps): React.JSX.Element {
  const reducedMotion = useReducedMotionEnabled();
  const values = useMemo(() => [new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)], []);

  useEffect(() => {
    if (!animated || reducedMotion) return undefined;
    return startTypingIndicatorAnimations(values);
  }, [animated, reducedMotion, values]);

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      style={[styles.container, variant === 'bubble' && styles.bubble]}
      testID={testID}
    >
      {values.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            animated && !reducedMotion ? { opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) } : null,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.xs,
  },
  bubble: {
    alignSelf: 'flex-start',
    backgroundColor: BscColors.surface,
    borderWidth: 1,
    borderColor: BscColors.border,
    borderRadius: BscRadius.md,
    borderBottomLeftRadius: BscRadius.xs,
    paddingHorizontal: BscSpacing.md,
    paddingVertical: BscSpacing.sm,
    marginHorizontal: BscSpacing.xs,
    marginBottom: BscSpacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BscRadius.pill,
    backgroundColor: BscColors.textTertiary,
  },
});
