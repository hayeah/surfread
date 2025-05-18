import { create } from 'zustand';

interface CommandPaletteState {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  isOpen: false,
  onClose: () => set({ isOpen: false }),
  onOpen: () => set({ isOpen: true }),
}));
