import { Image } from 'expo-image';
import { PureComponent } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Palette } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';

type NetImageProps = {
  uri?: string;
  fallbackIcon: IconName;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

type NetImageState = { failed: boolean };

/** Remote image that falls back to an icon tile if missing or unreachable. */
export class NetImage extends PureComponent<NetImageProps, NetImageState> {
  state: NetImageState = { failed: false };

  private handleError = () => this.setState({ failed: true });

  render() {
    const { uri, fallbackIcon, style, accessibilityLabel } = this.props;
    const showImage = uri && !this.state.failed;
    return (
      <View style={[styles.frame, style]}>
        <Icon name={fallbackIcon} size={40} color={Palette.brandTint} />
        {showImage && (
          <Image
            source={{ uri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
            onError={this.handleError}
            accessibilityLabel={accessibilityLabel}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surfaceContainer,
  },
});
