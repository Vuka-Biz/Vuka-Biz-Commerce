import { Component, type ContextType, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { MaxContentWidth, Palette, Shadow, Spacing } from '@/theme/tokens';

import { AppHeader, type AppHeaderProps } from './AppHeader';

type ScreenProps = {
  header?: Omit<AppHeaderProps, 'topInset'>;
  children: ReactNode;
  /** Pinned to the bottom (CTA bar, cart summary). */
  footer?: ReactNode;
  /** Floating layer above everything (toasts). */
  overlay?: ReactNode;
  /** Inside the tab navigator the tab bar already handles the bottom inset. */
  inTabs?: boolean;
  scroll?: boolean;
  gap?: keyof typeof Spacing;
  stickyHeaderIndices?: number[];
  /** Content column width; defaults to the phone column. */
  maxWidth?: number;
};

/**
 * Standard page shell: brand header, scrollable content constrained to a
 * phone-width column (so it also looks right on web), optional fixed footer.
 */
export class Screen extends Component<ScreenProps> {
  static contextType = SafeAreaInsetsContext;

  private get insets() {
    const insets = this.context as ContextType<typeof SafeAreaInsetsContext>;
    return insets ?? { top: 0, bottom: 0, left: 0, right: 0 };
  }

  private renderFooter() {
    const { footer, inTabs } = this.props;
    if (!footer) return null;
    return (
      <View style={[styles.footer, { paddingBottom: (inTabs ? 0 : this.insets.bottom) + Spacing.gutter }]}>
        <View style={styles.column}>{footer}</View>
      </View>
    );
  }

  render() {
    const { header, children, overlay, inTabs, scroll = true, gap = 'md', stickyHeaderIndices, maxWidth } = this.props;
    const bottomPad = (inTabs ? 0 : this.insets.bottom) + Spacing.xl;
    const content = <View style={[styles.column, { gap: Spacing[gap] }, maxWidth ? { maxWidth } : null]}>{children}</View>;

    return (
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {header && <AppHeader maxWidth={maxWidth} {...header} topInset={this.insets.top} />}
        {scroll ? (
          <ScrollView
            style={styles.root}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
            keyboardShouldPersistTaps="handled"
            stickyHeaderIndices={stickyHeaderIndices}
            showsVerticalScrollIndicator={false}>
            {content}
          </ScrollView>
        ) : (
          <View style={[styles.root, styles.scrollContent]}>{content}</View>
        )}
        {this.renderFooter()}
        {overlay}
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.surface },
  scrollContent: { paddingHorizontal: Spacing.gutter, paddingTop: Spacing.md },
  column: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  footer: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.gutter,
    backgroundColor: Palette.surfaceLowest,
    boxShadow: Shadow.bar,
  },
});
