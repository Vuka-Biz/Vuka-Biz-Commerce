import { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { Palette, Radius, Shadow, Spacing } from '@/theme/tokens';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type ToastProps = { bottomOffset?: number };
type ToastState = { message: string | null; icon: IconName; key: number };

/**
 * Imperative toast. Keep a ref and call `toast.show('Saved')`:
 *   const toast = useRef<Toast>(null);  <UI.Toast ref={toast} />
 */
export class Toast extends PureComponent<ToastProps, ToastState> {
  static readonly DURATION_MS = 2200;

  state: ToastState = { message: null, icon: 'check_circle', key: 0 };

  private timer?: ReturnType<typeof setTimeout>;

  show(message: string, icon: IconName = 'check_circle') {
    clearTimeout(this.timer);
    this.setState((s) => ({ message, icon, key: s.key + 1 }));
    this.timer = setTimeout(() => this.setState({ message: null }), Toast.DURATION_MS);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    const { message, icon, key } = this.state;
    return (
      <View pointerEvents="none" style={[styles.host, { bottom: this.props.bottomOffset ?? Spacing.lg }]}>
        {message && (
          <Animated.View
            key={key}
            entering={FadeInDown.duration(220)}
            exiting={FadeOutDown.duration(180)}
            style={styles.toast}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert">
            <Icon name={icon} size={20} color={Palette.accentBright} />
            <AppText variant="bodyStrong" color="onBrand" style={styles.text}>
              {message}
            </AppText>
          </Animated.View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: Spacing.md, right: Spacing.md, alignItems: 'center', zIndex: 100 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    maxWidth: 480,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.gutter,
    borderRadius: Radius.lg,
    backgroundColor: Palette.brand,
    boxShadow: Shadow.raised,
  },
  text: { flexShrink: 1 },
});
