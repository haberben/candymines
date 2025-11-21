export type IconType = 'play' | 'shop' | 'wallet' | 'quests' | 'profile' | 'settings' | 'cash_out' | 'sound';

export interface IconConfig {
  name: IconType;
  label: string;
  color: string;
  position: { x: number; y: number };
}

export const CANDY_COLORS = {
  fuchsia: '#FF5DA2',
  warmGold: '#FFB347',
  cyan: '#39E0C1',
  purple: '#7C4DFF',
  deepPurple: '#2B0B5E',
  rimGold: '#FFD84B',
  rimSoft: '#FFF1F6',
} as const;

export const ICON_CONFIGS: IconConfig[] = [
  { name: 'play', label: 'Play', color: CANDY_COLORS.fuchsia, position: { x: 0, y: 0 } },
  { name: 'shop', label: 'Shop', color: CANDY_COLORS.warmGold, position: { x: 1, y: 0 } },
  { name: 'wallet', label: 'Wallet', color: CANDY_COLORS.cyan, position: { x: 2, y: 0 } },
  { name: 'quests', label: 'Quests', color: CANDY_COLORS.purple, position: { x: 3, y: 0 } },
  { name: 'profile', label: 'Profile', color: CANDY_COLORS.fuchsia, position: { x: 0, y: 1 } },
  { name: 'settings', label: 'Settings', color: CANDY_COLORS.warmGold, position: { x: 1, y: 1 } },
  { name: 'cash_out', label: 'Cash Out', color: CANDY_COLORS.cyan, position: { x: 2, y: 1 } },
  { name: 'sound', label: 'Sound', color: CANDY_COLORS.purple, position: { x: 3, y: 1 } },
];
