/**
 * Sidebar Context
 * Global state management for sidebar collapse/expand
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// =====================================================
// TYPES
// =====================================================
interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  expandSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

// =====================================================
// CONTEXT
// =====================================================
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// =====================================================
// PROVIDER
// =====================================================
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    // Use setTimeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      if (stored !== null) {
        setIsCollapsed(stored === 'true');
      }
      setIsInitialized(true);
    }, 0);

    // Auto-collapse after 5-6 seconds on first load
    const timer = setTimeout(() => {
      if (!stored) {
        // Only auto-collapse if user hasn't set a preference
        setIsCollapsed(true);
        localStorage.setItem('sidebar-collapsed', 'true');
      }
    }, 5500);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timer);
    };
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('sidebar-collapsed', String(isCollapsed));
    }
  }, [isCollapsed, isInitialized]);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);
  const collapseSidebar = () => setIsCollapsed(true);
  const expandSidebar = () => setIsCollapsed(false);
  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);
  const closeMobileSidebar = () => setIsMobileOpen(false);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isMobileOpen,
        toggleSidebar,
        collapseSidebar,
        expandSidebar,
        toggleMobileSidebar,
        closeMobileSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
