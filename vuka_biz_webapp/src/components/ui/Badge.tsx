import { PureComponent } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Tone } from '@/models';
import { Palette, type PaletteColor, Radius, Spacing } from '@/theme/tokens';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export type BadgeTone = Tone | 'brandOnDark' | 'success';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
  pill?: boolean;
  uppercase?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Small status label ("32% Margin", "VERIFIED", "LIVE"). */
export class Badge extends PureComponent<BadgeProps> {
  static readonly tones: Record<BadgeTone, { bg: string; fg: PaletteColor }> = {
    brand: { bg: Palette.brand, fg: 'accentBright' },
    brandOnDark: { bg: 'rgba(216, 227, 251, 0.16)', fg: 'accentBright' },
    accent: { bg: Palette.accentBright, fg: 'onAccentContainer' },
    success: { bg: Palette.accent, fg: 'onAccent' },
    amber: { bg: Palette.amberSoft, fg: 'onAmber' },
    neutral: { bg: Palette.surfaceHigh, fg: 'textMuted' },
    danger: { bg: Palette.error, fg: 'onBrand' },
  };

  render() {
    const { label, tone = 'neutral', icon, pill = true, uppercase, style } = this.props;
    const t = Badge.tones[tone];
    return (
      <View style={[styles.badge, { backgroundColor: t.bg, borderRadius: pill ? Radius.full : Radius.sm }, style]}>
        {icon && <Icon name={icon} size={13} color={Palette[t.fg]} />}
        <AppText variant="labelSm" color={t.fg} uppercase={uppercase} numberOfLines={1}>
          {label}
        </AppText>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xxs + 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
  },
});
