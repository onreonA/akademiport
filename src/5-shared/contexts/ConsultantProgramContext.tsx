/**
 * Consultant Program Context
 * Sprint 7: Consultant Management
 *
 * Consultant'ın seçili programını yönetir
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Program } from '@/domain/entities/Program';

// =====================================================
// TYPES
// =====================================================

interface ConsultantProgramContextType {
  selectedProgram: Program | null;
  setSelectedProgram: (program: Program | null) => void;
  programs: Program[];
  setPrograms: (programs: Program[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// =====================================================
// CONTEXT
// =====================================================

const ConsultantProgramContext = createContext<ConsultantProgramContextType | undefined>(
  undefined
);

// =====================================================
// PROVIDER
// =====================================================

interface ConsultantProgramProviderProps {
  children: ReactNode;
}

export function ConsultantProgramProvider({ children }: ConsultantProgramProviderProps) {
  const [selectedProgram, setSelectedProgramState] = useState<Program | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load selected program from localStorage on mount
  useEffect(() => {
    const savedProgramId = localStorage.getItem('consultant_selected_program_id');
    if (savedProgramId && programs.length > 0) {
      const program = programs.find((p) => p.id === savedProgramId);
      if (program) {
        setSelectedProgramState(program);
      }
    }
  }, [programs]);

  // Save selected program to localStorage
  const setSelectedProgram = (program: Program | null) => {
    setSelectedProgramState(program);
    if (program) {
      localStorage.setItem('consultant_selected_program_id', program.id);
    } else {
      localStorage.removeItem('consultant_selected_program_id');
    }
  };

  const value: ConsultantProgramContextType = {
    selectedProgram,
    setSelectedProgram,
    programs,
    setPrograms,
    isLoading,
    setIsLoading,
  };

  return (
    <ConsultantProgramContext.Provider value={value}>
      {children}
    </ConsultantProgramContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function useConsultantProgram() {
  const context = useContext(ConsultantProgramContext);
  if (context === undefined) {
    throw new Error('useConsultantProgram must be used within a ConsultantProgramProvider');
  }
  return context;
}

