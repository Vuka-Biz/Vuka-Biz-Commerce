import { createRef, PureComponent, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { FontFamily, Palette, Radius, Spacing } from '@/theme/tokens';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  icon?: IconName;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
  /** Renders an eye toggle and masks the value. */
  secret?: boolean;
};

type TextFieldState = { focused: boolean; revealed: boolean };

export class TextField extends PureComponent<TextFieldProps, TextFieldState> {
  state: TextFieldState = { focused: false, revealed: false };

  private readonly input = createRef<TextInputInstance>();

  focus() {
    this.input.current?.focus();
  }

  private toggleReveal = () => this.setState((s) => ({ revealed: !s.revealed }));

  render() {
    const { label, icon, error, hint, trailing, secret, onFocus, onBlur, ...inputProps } = this.props;
    const { focused, revealed } = this.state;
    const borderColor = error ? Palette.error : focused ? Palette.accent : Palette.surfaceHighest;

    return (
      <View style={styles.wrapper}>
        {label && (
          <AppText variant="labelMd" color="textMuted" uppercase>
            {label}
          </AppText>
        )}
        <Pressable onPress={() => this.focus()} style={[styles.field, { borderColor }]}>
          {icon && <Icon name={icon} size={22} color={focused ? Palette.accent : Palette.textMuted} />}
          <TextInput
            ref={this.input}
            placeholderTextColor={Palette.outline}
            secureTextEntry={secret && !revealed}
            style={styles.input}
            onFocus={(e) => {
              this.setState({ focused: true });
              onFocus?.(e);
            }}
            onBlur={(e) => {
              this.setState({ focused: false });
              onBlur?.(e);
            }}
            {...inputProps}
          />
          {secret && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={revealed ? 'Hide PIN' : 'Show PIN'}
              hitSlop={10}
              onPress={this.toggleReveal}>
              <Icon name={revealed ? 'visibility_off' : 'visibility'} size={22} color={Palette.textMuted} />
            </Pressable>
          )}
          {trailing}
        </Pressable>
        {(error || hint) && (
          <AppText variant="bodySm" color={error ? 'error' : 'textMuted'}>
            {error ?? hint}
          </AppText>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 54,
    paddingHorizontal: Spacing.gutter,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    backgroundColor: Palette.surfaceLowest,
  },
  input: {
    flex: 1,
    minHeight: 50,
    fontFamily: FontFamily.body,
    fontSize: 16,
    color: Palette.text,
    outlineWidth: 0,
  },
});
