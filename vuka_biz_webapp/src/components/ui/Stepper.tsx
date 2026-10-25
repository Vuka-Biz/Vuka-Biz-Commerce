import { PureComponent } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Palette, Radius, Spacing } from '@/theme/tokens';

import { AppText } from './AppText';
import { Icon } from './Icon';

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
};

/** − qty + control. Dropping below `min` (default 0) is allowed so the item can be removed. */
export class Stepper extends PureComponent<StepperProps> {
  private decrement = () => {
    const { value, onChange, min = 0 } = this.props;
    if (value > min) onChange(value - 1);
  };

  private increment = () => this.props.onChange(this.props.value + 1);

  render() {
    const { value, label } = this.props;
    return (
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label} quantity`}
          onPress={this.decrement}
          style={({ pressed }) => [styles.btn, styles.minus, pressed && styles.pressed]}>
          <Icon name="remove" size={20} color={Palette.text} />
        </Pressable>
        <AppText variant="headlineSm" align="center" style={styles.value} accessibilityLiveRegion="polite">
          {value}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label} quantity`}
          onPress={this.increment}
          style={({ pressed }) => [styles.btn, styles.plus, pressed && styles.pressed]}>
          <Icon name="add" size={20} color={Palette.onAccent} />
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  btn: { width: 44, height: 44, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  minus: { backgroundColor: Palette.surfaceContainer },
  plus: { backgroundColor: Palette.accent },
  value: { minWidth: 28 },
  pressed: { transform: [{ scale: 0.94 }] },
});
