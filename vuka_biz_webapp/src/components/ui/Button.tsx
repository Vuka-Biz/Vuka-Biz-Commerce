import { PureComponent } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Palette, type PaletteColor, Radius, Spacing, type TypographyVariant } from '@/theme/tokens';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'accent' | 'brand' | 'secondary' | 'ghost' | 'danger' | 'light';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

type VariantStyle = { background: string; foreground: PaletteColor; border?: string };

export class Button extends PureComponent<ButtonProps> {
  static readonly variants: Record<ButtonVariant, VariantStyle> = {
    accent: { background: Palette.accent, foreground: 'onAccent' },
    brand: { background: Palette.brand, foreground: 'onBrand' },
    secondary: { background: Palette.surfaceContainer, foreground: 'text' },
    ghost: { background: Palette.transparent, foreground: 'accent', border: Palette.outlineVariant },
    danger: { background: Palette.error, foreground: 'onBrand' },
    light: { background: Palette.surfaceLowest, foreground: 'brand' },
  };

  static readonly sizes: Record<ButtonSize, { height: number; text: TypographyVariant; icon: number; padding: number }> = {
    sm: { height: 40, text: 'labelMd', icon: 18, padding: Spacing.gutter },
    md: { height: 48, text: 'labelLg', icon: 20, padding: Spacing.md },
    lg: { height: 56, text: 'headlineSm', icon: 22, padding: Spacing.lg },
  };

  render() {
    const {
      label,
      onPress,
      variant = 'accent',
      size = 'md',
      icon,
      iconRight,
      loading,
      disabled,
      fullWidth,
      style,
      accessibilityLabel,
    } = this.props;
    const v = Button.variants[variant];
    const s = Button.sizes[size];
    const inactive = disabled || loading;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: inactive, busy: loading }}
        disabled={inactive}
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          {
            minHeight: s.height,
            paddingHorizontal: s.padding,
            backgroundColor: v.background,
            borderColor: v.border ?? 'transparent',
            borderWidth: v.border ? 1 : 0,
          },
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          pressed && styles.pressed,
          style,
        ]}>
        {loading ? (
          <ActivityIndicator color={Palette[v.foreground]} />
        ) : (
          icon && <Icon name={icon} size={s.icon} color={Palette[v.foreground]} />
        )}
        <AppText variant={s.text} color={v.foreground} numberOfLines={1}>
          {label}
        </AppText>
        {iconRight && !loading && <Icon name={iconRight} size={s.icon} color={Palette[v.foreground]} />}
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
  },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
});
