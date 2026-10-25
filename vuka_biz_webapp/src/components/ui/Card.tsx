import { PureComponent } from 'react';
import { Pressable, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { Palette, Radius, Shadow, Spacing } from '@/theme/tokens';

export type CardTone = 'surface' | 'brand' | 'muted' | 'accent' | 'amber' | 'danger' | 'outline';

type CardProps = ViewProps & {
  tone?: CardTone;
  padding?: keyof typeof Spacing | 0;
  radius?: keyof typeof Radius;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export class Card extends PureComponent<CardProps> {
  static readonly tones: Record<CardTone, ViewStyle> = {
    surface: { backgroundColor: Palette.surfaceLowest, boxShadow: Shadow.card },
    brand: { backgroundColor: Palette.brand, boxShadow: Shadow.raised },
    muted: { backgroundColor: Palette.surfaceLow },
    accent: { backgroundColor: '#e3fbef', borderWidth: 1, borderColor: Palette.accentSoft },
    amber: { backgroundColor: '#fff4e5', borderWidth: 1, borderColor: Palette.amberSoft },
    danger: { backgroundColor: Palette.errorContainer, borderWidth: 1, borderColor: '#f5b3ab' },
    outline: { backgroundColor: Palette.surfaceLowest, borderWidth: 1, borderColor: Palette.surfaceHighest },
  };

  private get containerStyle(): StyleProp<ViewStyle> {
    const { tone = 'surface', padding = 'md', radius = 'xl', selected, style } = this.props;
    return [
      Card.tones[tone],
      {
        padding: padding === 0 ? 0 : Spacing[padding],
        borderRadius: Radius[radius],
      },
      selected && { borderWidth: 2, borderColor: Palette.accent },
      style,
    ];
  }

  render() {
    const { onPress, children, tone, padding, radius, selected, style, ...rest } = this.props;
    if (onPress) {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected }}
          onPress={onPress}
          style={({ pressed }) => [this.containerStyle, pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] }]}
          {...rest}>
          {children}
        </Pressable>
      );
    }
    return (
      <View style={this.containerStyle} {...rest}>
        {children}
      </View>
    );
  }
}
