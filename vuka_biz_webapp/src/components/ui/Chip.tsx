import { PureComponent } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Palette, Radius, Shadow, Spacing } from '@/theme/tokens';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type ChipProps = {
  label: string;
  icon?: IconName;
  selected?: boolean;
  onPress?: () => void;
};

/** Selectable filter pill (category chips on the Shop screen). */
export class Chip extends PureComponent<ChipProps> {
  render() {
    const { label, icon, selected, onPress } = this.props;
    const fg = selected ? Palette.accentBright : Palette.textMuted;
    return (
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.chip,
          { backgroundColor: selected ? Palette.brand : Palette.surfaceLowest },
          pressed && { transform: [{ scale: 0.97 }] },
        ]}>
        {icon && <Icon name={icon} size={18} color={fg} />}
        <AppText variant="labelMd" style={{ color: fg }}>
          {label}
        </AppText>
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    boxShadow: Shadow.card,
  },
});
