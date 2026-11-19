import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import type { ResolvedTheme } from '../../theme';
import type {
  BaseModalProps,
  PresentationMode,
} from '../../types/presentation';

export interface ModalWrapperProps extends BaseModalProps {
  presentation?: PresentationMode;
  children: React.ReactNode;
  theme: ResolvedTheme;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  presentation = 'modal',
  visible = false,
  onClose,
  children,
  theme,
  backdropOpacity,
  animationType,
  showHandle = true,
  closeOnBackdropPress = true,
}) => {
  if (presentation === 'inline') {
    return (
      <View
        style={[
          styles.inlineContainer,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            borderRadius: theme.borderRadius.lg,
          },
        ]}
      >
        {children}
      </View>
    );
  }

  const effectiveAnim =
    animationType ||
    (presentation === 'bottom-sheet'
      ? 'slide'
      : presentation === 'fullscreen'
        ? 'slide'
        : 'fade');

  const overlayBg =
    backdropOpacity !== undefined
      ? `rgba(0, 0, 0, ${backdropOpacity})`
      : theme.colors.modalOverlay;

  const isBottomSheet = presentation === 'bottom-sheet';
  const isFullscreen = presentation === 'fullscreen';

  return (
    <Modal
      transparent={!isFullscreen}
      visible={visible}
      animationType={effectiveAnim}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        {isFullscreen ? (
          <SafeAreaView
            style={[
              styles.fullscreenContainer,
              { backgroundColor: theme.colors.background },
            ]}
          >
            {children}
          </SafeAreaView>
        ) : (
          <View style={styles.modalBackdrop}>
            <Pressable
              style={[StyleSheet.absoluteFill, { backgroundColor: overlayBg }]}
              onPress={closeOnBackdropPress ? onClose : undefined}
            />

            <View
              style={[
                isBottomSheet
                  ? styles.bottomSheetContainer
                  : styles.centerModalContainer,
                {
                  backgroundColor: theme.colors.modalBackground,
                  borderColor: theme.colors.border,
                  borderRadius: isBottomSheet
                    ? theme.borderRadius.lg
                    : theme.borderRadius.lg,
                  borderBottomLeftRadius: isBottomSheet
                    ? 0
                    : theme.borderRadius.lg,
                  borderBottomRightRadius: isBottomSheet
                    ? 0
                    : theme.borderRadius.lg,
                },
              ]}
            >
              {isBottomSheet && showHandle && (
                <View style={styles.handleContainer}>
                  <View
                    style={[
                      styles.handleBar,
                      { backgroundColor: theme.colors.modalHandle },
                    ]}
                  />
                </View>
              )}
              {children}
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  inlineContainer: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  keyboardAvoid: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerModalContainer: {
    width: '90%',
    maxWidth: 420,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  fullscreenContainer: {
    flex: 1,
  },
  handleContainer: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
});
