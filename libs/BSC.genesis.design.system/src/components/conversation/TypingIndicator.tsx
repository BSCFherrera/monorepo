import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { startTypingIndicatorAnimations, useReducedMotionEnabled } from './animations';
import { styles } from './styles';
import type { TypingIndicatorProps } from './types';

export function TypingIndicator({ label = 'Typing', animated = true }: TypingIndicatorProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotionEnabled();

  useEffect(() => {
    if (!animated || reduceMotion) {
      pulse.setValue(0);
      rotate.setValue(0);
      shimmer.setValue(0);
      return;
    }

    return startTypingIndicatorAnimations(pulse, rotate, shimmer);
  }, [animated, reduceMotion, pulse, rotate, shimmer]);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] });
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.32, 0.08] });
  const rotateDeg = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const shimmerOpacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });

  return (
    <View style={styles.typingContainer} accessible accessibilityLabel={label}>
      <View style={styles.typingBubble}>
        <View style={styles.sphereWrap}>
          <Animated.View style={[styles.outerRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
          <Animated.View style={[styles.midRing, { transform: [{ rotate: rotateDeg }], opacity: shimmerOpacity }]} />
          <Animated.View style={[styles.core, { transform: [{ scale: pulseScale }] }]} />
          <Animated.View style={[styles.spark, { opacity: shimmerOpacity, transform: [{ rotate: rotateDeg }, { translateY: -18 }] }]} />
        </View>
      </View>
    </View>
  );
}
