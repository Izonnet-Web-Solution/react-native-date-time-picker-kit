import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ResolvedTheme } from '../../theme';

export interface PickerHeaderProps {
  title?: string;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  theme: ResolvedTheme;
  isRTL?: boolean;
}

export const PickerHeader: React.FC<PickerHeaderProps> = React.memo(
  ({
    title,
    cancelText = 'Cancel',
    confirmText = 'Confirm',
    onCancel,
    onConfirm,
    theme,
    isRTL = false,
  }) => {
    return (
      <View
        style={[
          styles.container,
          {
            borderBottomColor: theme.colors.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
            backgroundColor: theme.colors.headerBackground,
          },
        ]}
      >
        {onCancel ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={cancelText}
            onPress={onCancel}
            style={styles.actionButton}
          >
            <Text
              style={[
                styles.cancelText,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSizeMedium,
                },
              ]}
            >
              {cancelText}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionButton} />
        )}

        <Text
          numberOfLines={1}
          style={[
            styles.titleText,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSizeLarge,
              fontWeight: theme.typography.fontWeightMedium,
            },
          ]}
        >
          {title || ''}
        </Text>

        {onConfirm ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={confirmText}
            onPress={onConfirm}
            style={styles.actionButton}
          >
            <Text
              style={[
                styles.confirmText,
                {
                  color: theme.colors.primary,
                  fontSize: theme.typography.fontSizeMedium,
                  fontWeight: theme.typography.fontWeightMedium,
                },
              ]}
            >
              {confirmText}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionButton} />
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionButton: {
    minWidth: 64,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    flex: 1,
    textAlign: 'center',
  },
  cancelText: {},
  confirmText: {},
});
