import { AppHeader } from './AppHeader';
import { AppText } from './AppText';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';
import { Chip } from './Chip';
import { Icon } from './Icon';
import { IconTile } from './IconTile';
import { Divider, Row, Stack } from './Layout';
import { ListRow } from './ListRow';
import { NetImage } from './NetImage';
import { PinInput } from './PinInput';
import { ProgressBar } from './ProgressBar';
import { Screen } from './Screen';
import { SectionHeader } from './SectionHeader';
import { SegmentedControl } from './SegmentedControl';
import { Stepper } from './Stepper';
import { TextField } from './TextField';
import { Toast } from './Toast';

/**
 * Generic design-system components. Use them through this object:
 *   <UI.Card tone="brand"><UI.Text variant="headlineMd">…</UI.Text></UI.Card>
 */
export const UI = {
  AppHeader,
  Badge,
  Button,
  Card,
  Chip,
  Divider,
  Icon,
  IconTile,
  ListRow,
  NetImage,
  PinInput,
  ProgressBar,
  Row,
  Screen,
  SectionHeader,
  SegmentedControl,
  Stack,
  Stepper,
  Text: AppText,
  TextField,
  Toast,
} as const;

export type { IconName } from './Icon';
export type { HeaderAction } from './AppHeader';
export { PinInput, TextField, Toast };
