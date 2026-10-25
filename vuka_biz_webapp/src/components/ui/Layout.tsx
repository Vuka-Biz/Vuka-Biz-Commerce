import { PureComponent } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Palette, Spacing } from '@/theme/tokens';

type Gap = keyof typeof Spacing;

type StackProps = ViewProps & {
  gap?: Gap;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  flex?: number;
  wrap?: boolean;
};

/** Vertical flex container with token-based gap. */
export class Stack extends PureComponent<StackProps> {
  protected readonly direction: 'row' | 'column' = 'column';

  render() {
    const { gap, align, justify, flex, wrap, style, ...rest } = this.props;
    return (
      <View
        style={[
          {
            flexDirection: this.direction,
            gap: gap ? Spacing[gap] : undefined,
            alignItems: align,
            justifyContent: justify,
            flex,
            flexWrap: wrap ? 'wrap' : undefined,
          },
          style,
        ]}
        {...rest}
      />
    );
  }
}

/** Horizontal flex container; centres children vertically by default. */
export class Row extends Stack {
  protected readonly direction = 'row' as const;

  static defaultProps: Partial<StackProps> = { align: 'center' };
}

export class Divider extends PureComponent<{ inset?: number }> {
  render() {
    return <View style={[styles.divider, { marginHorizontal: this.props.inset ?? 0 }]} />;
  }
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Palette.outlineVariant,
  },
});
