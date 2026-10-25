import { PureComponent } from 'react';
import { View } from 'react-native';

import { Palette, Radius } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';

type IconTileProps = {
  icon: IconName;
  size?: number;
  background?: string;
  color?: string;
  round?: boolean;
};

/** An icon centred in a tinted square or circle. */
export class IconTile extends PureComponent<IconTileProps> {
  render() {
    const { icon, size = 40, background = Palette.surfaceContainer, color = Palette.brand, round } = this.props;
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: round ? Radius.full : Radius.md,
          backgroundColor: background,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon name={icon} size={Math.round(size * 0.55)} color={color} />
      </View>
    );
  }
}
