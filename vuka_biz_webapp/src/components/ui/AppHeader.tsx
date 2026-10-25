import { PureComponent } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MaxContentWidth, Palette, Radius, Shadow, Spacing } from '@/theme/tokens';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export type HeaderAction = { icon: IconName; label: string; onPress: () => void; badge?: boolean };

export type AppHeaderProps = {
  title: string;
  eyebrow?: string;
  brandIcon?: IconName;
  onBack?: () => void;
  actions?: readonly HeaderAction[];
  avatarInitials?: string;
  topInset?: number;
};

/** Dark brand bar used at the top of every signed-in screen. */
export class AppHeader extends PureComponent<AppHeaderProps> {
  private renderLeading() {
    const { onBack, brandIcon = 'storefront' } = this.props;
    if (onBack) {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          hitSlop={8}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <Icon name="arrow_back" size={26} color={Palette.onBrand} />
        </Pressable>
      );
    }
    return (
      <View style={styles.brandTile}>
        <Icon name={brandIcon} size={24} color={Palette.onAccent} />
      </View>
    );
  }

  render() {
    const { title, eyebrow = 'VUKA BIZ', actions = [], avatarInitials, topInset = 0, onBack } = this.props;
    return (
      <View style={[styles.bar, { paddingTop: topInset }]}>
        <View style={styles.inner}>
          {this.renderLeading()}
          <View style={styles.titles}>
            {!onBack && (
              <AppText variant="labelSm" color="accentBright" uppercase>
                {eyebrow}
              </AppText>
            )}
            <AppText variant="headlineSm" color="onBrand" numberOfLines={1} accessibilityRole="header">
              {title}
            </AppText>
          </View>
          {actions.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={action.onPress}
              hitSlop={4}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
              <Icon name={action.icon} size={24} color={Palette.onBrand} />
              {action.badge && <View style={styles.dot} />}
            </Pressable>
          ))}
          {avatarInitials && (
            <View style={styles.avatar} accessibilityLabel="Your profile">
              <AppText variant="labelSm" color="brand">
                {avatarInitials}
              </AppText>
            </View>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bar: { backgroundColor: Palette.brand, boxShadow: Shadow.card, zIndex: 10 },
  inner: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.gutter,
    width: '100%',
    // Same edges as the Screen content column (column width + its side gutters).
    maxWidth: MaxContentWidth + Spacing.gutter * 2,
    alignSelf: 'center',
  },
  brandTile: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: { flex: 1, minWidth: 0 },
  iconButton: { width: 44, height: 44, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  pressed: { backgroundColor: 'rgba(79, 99, 89, 0.35)' },
  dot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.amber,
    borderWidth: 1.5,
    borderColor: Palette.brand,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    backgroundColor: Palette.accentBright,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
});
