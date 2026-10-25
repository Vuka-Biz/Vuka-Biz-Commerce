import { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { UI } from '@/components/ui';
import { Palette, Radius } from '@/theme/tokens';

type BrandMarkProps = { size?: 'md' | 'lg'; showTagline?: boolean };

/** Vuka Biz logo: storefront tile + wordmark. */
export class BrandMark extends PureComponent<BrandMarkProps> {
  render() {
    const large = this.props.size === 'lg';
    const tile = large ? 88 : 56;
    return (
      <View style={styles.wrap}>
        <View style={[styles.tile, { width: tile, height: tile, borderRadius: large ? Radius.xl + 8 : Radius.xl }]}>
          <UI.Icon name="storefront" size={tile * 0.55} color={Palette.onAccent} />
        </View>
        <View style={styles.words}>
          <UI.Text variant={large ? 'display' : 'headlineLg'} color="onBrand">
            VUKA<UI.Text variant={large ? 'display' : 'headlineLg'} color="accentBright"> BIZ</UI.Text>
          </UI.Text>
          {this.props.showTagline && (
            <UI.Text variant="labelMd" color="brandMuted" uppercase align="center">
              Trade Local. Scale Formal.
            </UI.Text>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 16 },
  tile: {
    backgroundColor: Palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 10px 30px rgba(0, 108, 73, 0.45)',
  },
  words: { alignItems: 'center', gap: 4 },
});
