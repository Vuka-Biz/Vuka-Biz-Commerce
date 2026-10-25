import { PureComponent } from 'react';
import { Text, type TextProps } from 'react-native';

import { Palette, type PaletteColor, Typography, type TypographyVariant } from '@/theme/tokens';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: PaletteColor;
  align?: 'left' | 'center' | 'right';
  uppercase?: boolean;
};

export class AppText extends PureComponent<AppTextProps> {
  render() {
    const { variant = 'bodyMd', color = 'text', align, uppercase, style, ...rest } = this.props;
    return (
      <Text
        style={[
          Typography[variant],
          { color: Palette[color] },
          align && { textAlign: align },
          uppercase && { textTransform: 'uppercase' },
          style,
        ]}
        {...rest}
      />
    );
  }
}
