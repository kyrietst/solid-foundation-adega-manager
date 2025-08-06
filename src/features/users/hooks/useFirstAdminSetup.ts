/**
 * Hook para setup inicial do sistema (primeiro admin)
 * Extraído do UserManagement.tsx para separar responsabilidades
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/core/api/supabase/client';
import { useAuth } from '@/app/providers/AuthContext';
import { FirstAdminSetupState } from '@/components/users/types';

export const useFirstAdminSetup = (): FirstAdminSetupState => {
  const [showFirstAdminSetup, setShowFirstAdminSetup] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const { hasPermission } = useAuth();

  const checkForExistingUsers = async (): Promise<void> => {
    setIsSettingUp(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Error checking users:', error);
        setIsSettingUp(false);
        return;
      }

      if (!data || data.length === 0) {
        // No users found, show first admin setup
        setShowFirstAdminSetup(true);
      } else {
        // Users exist, proceed to normal user management
        setShowFirstAdminSetup(false);
      }
    } catch (error) {
      console.error('Error in checkForExistingUsers:', error);
    } finally {
      setIsSettingUp(false);
    }
  };

  // Auto-check on mount
  useEffect(() => {
    checkForExistingUsers();
  }, []);

  return {
    showFirstAdminSetup,
    isSettingUp,
    checkForExistingUsers,
  };
};