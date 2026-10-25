import { PureComponent } from 'react';
import { View } from 'react-native';

import { Palette, Radius } from '@/theme/tokens';

type ProgressBarProps = {
  /** 0 – 1 */
  value: number;
  height?: number;
  color?: string;
  track?: string;
};

export class ProgressBar extends PureComponent<ProgressBarProps> {
  render() {
    const { value, height = 8, color = Palette.accent, track = Palette.surfaceHigh } = this.props;
    const pct = Math.max(0, Math.min(1, value)) * 100;
    return (
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
        style={{ height, borderRadius: Radius.full, backgroundColor: track, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: '100%', borderRadius: Radius.full, backgroundColor: color }} />
      </View>
    );
  }
}
