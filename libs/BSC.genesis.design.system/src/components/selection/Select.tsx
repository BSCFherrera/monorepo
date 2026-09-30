import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { tokens } from '../../tokens';
import { renderFeatherIcon } from '../icons';
import { SelectDropdown } from './SelectDropdown';
import { styles } from './styles';
import type { HostInstance } from 'react-native';
import type { SelectProps } from './types';

export function Select({
  label,
  accessibilityLabel,
  options,
  data,
  value,
  onChange,
  onSelect,
  disabled = false,
  readOnly = false,
  error = false,
  placeholder = 'Select an option',
  width = '100%',
  align,
  containerStyle,
}: SelectProps) {
  const normalizedOptions = options ?? data?.map((option) => {
    if (typeof option === 'string' || typeof option === 'number') {
      return { label: String(option), value: option };
    }
    return option;
  }) ?? [];
  const handleChange = onChange ?? onSelect ?? (() => {});
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HostInstance>(null);
  const animatedScale = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const alive = useRef(true);
  const blocked = useRef(disabled || readOnly);
  blocked.current = disabled || readOnly;

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      animatedScale.stopAnimation();
      animatedOpacity.stopAnimation();
    };
  }, [animatedScale, animatedOpacity]);

  useEffect(() => {
    if (disabled || readOnly) setIsOpen(false);
  }, [disabled, readOnly]);

  const animateOpen = useCallback(() => {
    Animated.parallel([
      Animated.timing(animatedScale, {
        toValue: 1,
        duration: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [animatedScale, animatedOpacity]);

  const animateClose = useCallback(
    (callback?: () => void) => {
      Animated.parallel([
        Animated.timing(animatedScale, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 100,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (alive.current) callback?.();
      });
    },
    [animatedScale, animatedOpacity],
  );

  const closeDropdown = useCallback(() => {
    animateClose(() => setIsOpen(false));
  }, [animateClose]);

  const toggleDropdown = useCallback(() => {
    if (disabled || readOnly) return;

    if (isOpen) {
      closeDropdown();
    } else {
      triggerRef.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
        if (!alive.current || blocked.current) return;
        const spaceBelow = windowHeight - (y + measuredHeight);
        const estimatedDropdownHeight = Math.min(normalizedOptions.length * 52, 260);
        const dropdownTop =
          spaceBelow < estimatedDropdownHeight + 16
            ? y - estimatedDropdownHeight - 4
            : y + measuredHeight + 4;

        setPosition({
          top: Math.max(4, dropdownTop),
          left: Math.max(4, Math.min(x, windowWidth - measuredWidth - 4)),
          width: Math.min(measuredWidth, windowWidth - 8),
        });
        setIsOpen(true);
        animatedScale.setValue(0);
        animatedOpacity.setValue(0);
        animateOpen();
      });
    }
  }, [
    disabled,
    readOnly,
    isOpen,
    closeDropdown,
    windowHeight,
    normalizedOptions.length,
    windowWidth,
    animatedScale,
    animatedOpacity,
    animateOpen,
  ]);

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  return (
    <View style={[styles.selectWrapper, { width }, containerStyle]}>
      {label && <Text style={styles.selectLabel}>{label}</Text>}
      <Pressable
        ref={triggerRef}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label ?? 'Select'}
        accessibilityState={{ disabled: disabled || readOnly, expanded: isOpen && !disabled && !readOnly }}
        disabled={disabled || readOnly}
        onPress={toggleDropdown}
        style={[
          styles.selectTrigger,
          error ? styles.selectTriggerError : undefined,
          disabled ? styles.selectTriggerDisabled : undefined,
        ]}
      >
        <Text
          style={[
            styles.selectText,
            !selectedOption ? styles.selectPlaceholder : undefined,
            disabled ? { color: tokens.colors.textDisabled } : undefined,
            align ? { textAlign: align } : undefined,
          ]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        {renderFeatherIcon({
          name: 'chevron-down',
          size: 20,
          color: disabled ? tokens.colors.textDisabled : tokens.colors.text,
        }) ?? <Text style={styles.selectChevron}>▾</Text>}
      </Pressable>

      <SelectDropdown
        visible={isOpen}
        options={normalizedOptions}
        value={value}
        position={position}
        windowHeight={windowHeight}
        animatedOpacity={animatedOpacity}
        animatedScale={animatedScale}
        isBlocked={() => blocked.current}
        onRequestClose={closeDropdown}
        onChange={handleChange}
        onDismissAfterSelect={() => setIsOpen(false)}
      />
    </View>
  );
}
