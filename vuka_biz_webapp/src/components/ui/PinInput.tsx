import { createRef, PureComponent, type RefObject } from 'react';
import { StyleSheet, TextInput, View, type TextInputInstance, type TextInputKeyPressEvent } from 'react-native';

import { FontFamily, Palette, Radius, Spacing } from '@/theme/tokens';

type PinInputProps = {
  length?: number;
  onChange: (pin: string) => void;
  /** Light inputs for dark cards. */
  onDark?: boolean;
  error?: boolean;
};

type PinInputState = { digits: string[] };

/** Row of single-digit boxes that auto-advance, like an OTP field. */
export class PinInput extends PureComponent<PinInputProps, PinInputState> {
  private readonly refs: RefObject<TextInputInstance | null>[];

  constructor(props: PinInputProps) {
    super(props);
    const length = props.length ?? 4;
    this.state = { digits: Array(length).fill('') };
    this.refs = Array.from({ length }, () => createRef<TextInputInstance>());
  }

  clear() {
    this.update(this.state.digits.map(() => ''));
    this.refs[0].current?.focus();
  }

  private update(digits: string[]) {
    this.setState({ digits });
    this.props.onChange(digits.join(''));
  }

  private handleChange(index: number, text: string) {
    const clean = text.replace(/\D/g, '');
    const digits = [...this.state.digits];

    // Support pasting the whole code into one box.
    if (clean.length > 1) {
      clean
        .slice(0, digits.length - index)
        .split('')
        .forEach((d, offset) => (digits[index + offset] = d));
      this.update(digits);
      this.refs[Math.min(index + clean.length, digits.length - 1)].current?.focus();
      return;
    }

    digits[index] = clean;
    this.update(digits);
    if (clean && index < digits.length - 1) this.refs[index + 1].current?.focus();
  }

  private handleKeyPress(index: number, e: TextInputKeyPressEvent) {
    if (e.nativeEvent.key === 'Backspace' && !this.state.digits[index] && index > 0) {
      this.refs[index - 1].current?.focus();
    }
  }

  render() {
    const { onDark, error } = this.props;
    return (
      <View style={styles.row}>
        {this.state.digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={this.refs[index]}
            value={digit}
            onChangeText={(text) => this.handleChange(index, text)}
            onKeyPress={(e) => this.handleKeyPress(index, e)}
            keyboardType="number-pad"
            maxLength={index === 0 ? this.state.digits.length : 1}
            selectTextOnFocus
            accessibilityLabel={`PIN digit ${index + 1}`}
            style={[
              styles.box,
              onDark ? styles.boxDark : styles.boxLight,
              digit !== '' && (onDark ? styles.filledDark : styles.filledLight),
              error && styles.error,
            ]}
          />
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center' },
  box: {
    width: 56,
    height: 60,
    borderRadius: Radius.lg,
    borderWidth: 2,
    textAlign: 'center',
    fontFamily: FontFamily.display,
    fontSize: 26,
    outlineWidth: 0,
  },
  boxLight: { backgroundColor: Palette.surfaceLowest, borderColor: Palette.surfaceHighest, color: Palette.text },
  boxDark: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', color: Palette.onBrand },
  filledLight: { borderColor: Palette.accent },
  filledDark: { borderColor: Palette.accentBright },
  error: { borderColor: Palette.error },
});
