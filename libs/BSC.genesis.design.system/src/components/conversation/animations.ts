import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

export function useReducedMotionEnabled() {
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(value => { if (active) setReduceMotion(value); })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}

export function startTypingIndicatorAnimations(
  pulse: Animated.Value,
  rotate: Animated.Value,
  shimmer: Animated.Value,
) {
  const pulseLoop = Animated.loop(
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]),
  );
  const rotateLoop = Animated.loop(
    Animated.timing(rotate, { toValue: 1, duration: 3200, easing: Easing.linear, useNativeDriver: true }),
  );
  const shimmerLoop = Animated.loop(
    Animated.sequence([
      Animated.timing(shimmer, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(shimmer, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]),
  );

  pulseLoop.start();
  rotateLoop.start();
  shimmerLoop.start();

  return () => {
    pulseLoop.stop();
    rotateLoop.stop();
    shimmerLoop.stop();
  };
}
