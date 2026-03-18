import { QREyeShape, QRModuleShape } from '@/stores/useQRSettingsStore';

import type { EyeOptions, BorderRadius } from 'react-native-qrcode-styled';

export interface ModuleProps {
  pieceBorderRadius: BorderRadius;
  pieceScale:        number;
  pieceRotation:     number | string;
  isPiecesGlued:     boolean;
}

export function getModuleProps(shape: QRModuleShape): ModuleProps {
  switch (shape) {
    case 'rounded':
      return { pieceBorderRadius: '40%', pieceScale: 1.0,  pieceRotation: 0,     isPiecesGlued: false };
    case 'dots':
      return { pieceBorderRadius: '50%', pieceScale: 0.82, pieceRotation: 0,     isPiecesGlued: false };
    case 'diamond':
      return { pieceBorderRadius: 0,     pieceScale: 0.75, pieceRotation: '45deg', isPiecesGlued: false };
    case 'star':
      return { pieceBorderRadius: '20%', pieceScale: 0.72, pieceRotation: '45deg', isPiecesGlued: false };
    case 'square':
    default:
      return { pieceBorderRadius: 0,     pieceScale: 1.03, pieceRotation: 0,     isPiecesGlued: false };
  }
}

export function getEyeProps(shape: QREyeShape): { outer: EyeOptions; inner: EyeOptions } {
  switch (shape) {
    case 'rounded':
      return { outer: { borderRadius: '30%' }, inner: { borderRadius: '25%' } };
    case 'dots':
      return { outer: { borderRadius: '50%' }, inner: { borderRadius: '50%' } };
    case 'classic-rounded':
      return { outer: { borderRadius: 0 },     inner: { borderRadius: '30%' } };
    case 'classic':
    case 'square':
    default:
      return { outer: { borderRadius: 0 },     inner: { borderRadius: 0 } };
  }
}
