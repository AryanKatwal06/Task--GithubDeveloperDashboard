/**
 * UI Slice
 *
 * Manages global UI state: modals, toasts, loading indicators
 * Supports stacking multiple modals
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../';

// ============================================================================
// STATE & TYPES
// ============================================================================

export type ModalType = 'error' | 'success' | 'info' | 'confirm';
export type ToastSeverity = 'error' | 'success' | 'info' | 'warning';

export interface Modal {
  id: string;
  type: ModalType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface Toast {
  id: string;
  severity: ToastSeverity;
  message: string;
  duration?: number;
}

export interface UISliceState {
  modals: Modal[];
  toasts: Toast[];
  isGlobalLoading: boolean;
  globalLoadingMessage?: string;
}

const initialState: UISliceState = {
  modals: [],
  toasts: [],
  isGlobalLoading: false,
};

// ============================================================================
// SLICE
// ============================================================================

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /**
     * Show a modal dialog
     */
    showModal: (state, action: PayloadAction<Omit<Modal, 'id'>>) => {
      const id = `modal-${Date.now()}-${Math.random()}`;
      state.modals.push({ ...action.payload, id });
    },

    /**
     * Close the last modal (or specific modal by id)
     */
    closeModal: (state, action?: PayloadAction<string>) => {
      if (action?.payload) {
        state.modals = state.modals.filter((m) => m.id !== action.payload);
      } else {
        state.modals.pop();
      }
    },

    /**
     * Close all modals
     */
    closeAllModals: (state) => {
      state.modals = [];
    },

    /**
     * Show a toast notification
     */
    showToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      state.toasts.push({ ...action.payload, id });
    },

    /**
     * Dismiss a specific toast
     */
    dismissToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },

    /**
     * Clear all toasts
     */
    clearToasts: (state) => {
      state.toasts = [];
    },

    /**
     * Set global loading indicator
     */
    setGlobalLoading: (state, action: PayloadAction<{ loading: boolean; message?: string }>) => {
      state.isGlobalLoading = action.payload.loading;
      state.globalLoadingMessage = action.payload.message;
    },

    /**
     * Reset UI state
     */
    resetUI: () => initialState,
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const {
  showModal,
  closeModal,
  closeAllModals,
  showToast,
  dismissToast,
  clearToasts,
  setGlobalLoading,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;

// ============================================================================
// SELECTORS
// ============================================================================

export const selectModals = (state: RootState): Modal[] => {
  if (!state || typeof state !== 'object' || !state.ui) {
    console.warn('[UI] Invalid state object or UI slice not found');
    return [];
  }
  return state.ui.modals;
};

export const selectLastModal = (state: RootState): Modal | undefined => {
  if (!state || typeof state !== 'object' || !state.ui) {
    console.warn('[UI] Invalid state object or UI slice not found');
    return undefined;
  }
  const modals = state.ui.modals;
  return modals[modals.length - 1];
};

export const selectHasModals = (state: RootState): boolean => {
  if (!state || typeof state !== 'object' || !state.ui) {
    console.warn('[UI] Invalid state object or UI slice not found');
    return false;
  }
  return state.ui.modals.length > 0;
};

export const selectToasts = (state: RootState): Toast[] => {
  if (!state || typeof state !== 'object' || !state.ui) {
    console.warn('[UI] Invalid state object or UI slice not found');
    return [];
  }
  return state.ui.toasts;
};

export const selectIsGlobalLoading = (state: RootState): boolean => {
  if (!state || typeof state !== 'object' || !state.ui) {
    console.warn('[UI] Invalid state object or UI slice not found');
    return false;
  }
  return state.ui.isGlobalLoading;
};

export const selectGlobalLoadingMessage = (state: RootState): string | undefined => {
  if (!state || typeof state !== 'object' || !state.ui) {
    console.warn('[UI] Invalid state object or UI slice not found');
    return undefined;
  }
  return state.ui.globalLoadingMessage;
};
