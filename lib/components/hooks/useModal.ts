// =====================================================
// MODAL HOOK
// =====================================================
// Modal state management hook'u
'use client';
import { useCallback, useState } from 'react';
export interface ModalState {
  isOpen: boolean;
  data?: any;
}
export function useModal(initialState: boolean = false) {
  const [state, setState] = useState<ModalState>({
    isOpen: initialState,
    data: undefined,
  });
  const openModal = useCallback((data?: any) => {
    setState({
      isOpen: true,
      data,
    });
  }, []);
  const closeModal = useCallback(() => {
    setState({
      isOpen: false,
      data: undefined,
    });
  }, []);
  const toggleModal = useCallback((data?: any) => {
    setState(prev => ({
      isOpen: !prev.isOpen,
      data: prev.isOpen ? undefined : data,
    }));
  }, []);
  return {
    isOpen: state.isOpen,
    data: state.data,
    openModal,
    closeModal,
    toggleModal,
  };
}
