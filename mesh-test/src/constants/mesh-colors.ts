// MeshAid brand + status tokens. These sit alongside constants/theme.ts rather than
// replacing it — Colors/Spacing/Fonts from theme.ts still drive base UI chrome.

import type { MeshStatus } from './mock-mesh-data.ts';

export const MeshBrand = {
  forest: '#17392B',
  moss: '#4F7A5B',
  cream: '#F5F1E7',
  card: '#FFFFFF',
  muted: '#6B6F66',
  hairline: '#E4E0D3',
} as const;

export const StatusColor: Record<MeshStatus, { fg: string; bg: string }> = {
  safe: { fg: '#1F7A45', bg: '#E1EFE3' },
  help: { fg: '#B8791A', bg: '#F7EAD0' },
  sos: { fg: '#C23B32', bg: '#F8E0DD' },
};