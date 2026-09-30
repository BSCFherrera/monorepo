import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import {COLORS, SPACING} from '@constants/theme';

export const TypingIndicator: React.FC = () => {
  const pulse = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const rotateLoop = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 3200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
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
  }, [pulse, rotate, shimmer]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.08],
  });

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });

  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.32, 0.08],
  });

  const rotateDeg = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  });

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <View style={styles.sphereWrap}>
          <Animated.View
            style={[
              styles.outerRing,
              {
                transform: [{scale: ringScale}],
                opacity: ringOpacity,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.midRing,
              {
                transform: [{rotate: rotateDeg}],
                opacity: shimmerOpacity,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.core,
              {
                transform: [{scale: pulseScale}],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.spark,
              {
                opacity: shimmerOpacity,
                transform: [{rotate: rotateDeg}, {translateY: -18}],
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  bubble: {
    backgroundColor: COLORS.botMessage,
    borderWidth: 1,
    borderColor: COLORS.messageBorder,
    borderRadius: 16,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignSelf: 'flex-start',
  },
  sphereWrap: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#95B8FF',
  },
  midRing: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#4D8DFF',
    borderTopColor: '#67E8F9',
    borderRightColor: '#22C55E',
  },
  core: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0A66F7',
    borderWidth: 1,
    borderColor: '#7BB2FF',
  },
  spark: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#7CF6D0',
    position: 'absolute',
  },
});
