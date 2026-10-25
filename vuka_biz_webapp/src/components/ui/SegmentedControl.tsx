import { PureComponent } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Palette, Radius, Shadow, Spacing } from '@/theme/tokens';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export type Segment<T extends string> = { value: T; label: string; icon?: IconName };

type SegmentedControlProps<T extends string> = {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
};

export class SegmentedControl<T extends string> extends PureComponent<SegmentedControlProps<T>> {
  render() {
    const { segments, value, onChange } = this.props;
    return (
      <View style={styles.track} accessibilityRole="tablist">
        {segments.map((segment) => {
          const active = segment.value === value;
          return (
            <Pressable
              key={segment.value}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(segment.value)}
              style={[styles.segment, active && styles.active]}>
              {segment.icon && (
                <Icon name={segment.icon} size={18} color={active ? Palette.accent : Palette.textMuted} />
              )}
              <AppText variant="labelMd" color={active ? 'text' : 'textMuted'}>
                {segment.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: Spacing.xs,
    gap: Spacing.xs,
    borderRadius: Radius.lg,
    backgroundColor: Palette.surfaceContainer,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    borderRadius: Radius.md,
  },
  active: { backgroundColor: Palette.surfaceLowest, boxShadow: Shadow.card },
});
