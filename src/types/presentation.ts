export type PresentationMode =
  'native' | 'inline' | 'modal' | 'bottom-sheet' | 'fullscreen';

export type ModalAnimationType = 'slide' | 'fade' | 'none';

export interface BaseModalProps {
  visible?: boolean;
  onClose?: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  backdropOpacity?: number;
  animationType?: ModalAnimationType;
  showHandle?: boolean; // For bottom-sheet
  closeOnBackdropPress?: boolean;
  customHeader?: React.ReactNode;
  customFooter?: React.ReactNode;
  testID?: string;
}
