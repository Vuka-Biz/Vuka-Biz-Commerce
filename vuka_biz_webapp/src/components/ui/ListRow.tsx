import { PureComponent, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Palette, Spacing } from '@/theme/tokens';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { IconTile } from './IconTile';

type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  iconBackground?: string;
  iconColor?: string;
  trailing?: ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
};

export class ListRow extends PureComponent<ListRowProps> {
  private renderContent() {
    const { title, subtitle, icon, iconBackground, iconColor, trailing, showChevron } = this.props;
    return (
      <>
        {icon && <IconTile icon={icon} background={iconBackground} color={iconColor} />}
        <View style={styles.text}>
          <AppText variant="bodyStrong">{title}</AppText>
          {subtitle && (
            <AppText variant="bodySm" color="textMuted">
              {subtitle}
            </AppText>
          )}
        </View>
        {trailing}
        {showChevron && <Icon name="chevron_right" size={20} color={Palette.outline} />}
      </>
    );
  }

  render() {
    const { onPress, title } = this.props;
    if (!onPress) return <View style={styles.row}>{this.renderContent()}</View>;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
        {this.renderContent()}
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gutter,
    minHeight: 56,
    paddingVertical: Spacing.sm,
  },
  text: { flex: 1, gap: 2 },
});
