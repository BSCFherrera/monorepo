import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, type DimensionValue, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { tokens } from '../../tokens';

export interface ButtonPillProps {
  children: ReactNode;
  onPress: () => void;
  backgroundColor?: string;
  textColor?: string;
  width?: DimensionValue;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}
export function ButtonPill({ children, onPress, backgroundColor = '#007AFF', textColor = '#FFFFFF', width, disabled, loading, accessibilityLabel, containerStyle, textStyle }: ButtonPillProps) {
  const blocked = !!(disabled || loading);
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? (typeof children === 'string' ? children : undefined)} accessibilityState={{ disabled: blocked, busy: !!loading }} disabled={blocked} onPress={blocked ? undefined : onPress}
    style={({ pressed }) => [{ borderRadius: 999, paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor, width, opacity: blocked ? 0.5 : pressed ? 0.7 : 1 }, containerStyle]}>
    {loading ? <ActivityIndicator color={textColor} /> : <Text style={[{ fontSize: 16, fontWeight: '700', textAlign: 'center', color: textColor }, textStyle]}>{children}</Text>}
  </Pressable>;
}
export interface ButtonOutlinedFlatProps extends Omit<ButtonPillProps, 'backgroundColor' | 'textColor'> { color?: string }
export function ButtonOutlinedFlat({ color = tokens.colors.primary, disabled, containerStyle, textStyle, ...props }: ButtonOutlinedFlatProps) {
  const tint = disabled ? tokens.colors.textDisabled : color;
  return <ButtonPill {...props} disabled={disabled} backgroundColor="transparent" textColor={tint}
    containerStyle={[{ paddingVertical: 10, borderWidth: 1.5, borderColor: tint, opacity: 1 }, containerStyle]}
    textStyle={[{ fontSize: 15 }, textStyle]} />;
}
