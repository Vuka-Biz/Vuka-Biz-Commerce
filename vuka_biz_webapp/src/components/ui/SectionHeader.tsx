import { PureComponent, type ReactNode } from 'react';

import { Palette, type PaletteColor } from '@/theme/tokens';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { Row } from './Layout';

type SectionHeaderProps = {
  title: string;
  icon?: IconName;
  trailing?: ReactNode;
  color?: PaletteColor;
};

export class SectionHeader extends PureComponent<SectionHeaderProps> {
  render() {
    const { title, icon, trailing, color = 'text' } = this.props;
    return (
      <Row justify="space-between" gap="sm">
        <Row gap="xs" flex={1}>
          {icon && <Icon name={icon} size={20} color={Palette.accent} />}
          <AppText variant="labelLg" color={color} uppercase numberOfLines={1}>
            {title}
          </AppText>
        </Row>
        {typeof trailing === 'string' ? (
          <AppText variant="bodySm" color="textMuted">
            {trailing}
          </AppText>
        ) : (
          trailing
        )}
      </Row>
    );
  }
}
