/**
 * Component responsible for handling temporary password changes
 * Shows the mandatory password change modal when user has a temporary password
 */

import React from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { ChangeTemporaryPasswordModal } from '@/features/users/components/ChangeTemporaryPasswordModal';

export const TempPasswordHandler: React.FC = () => {
  const { user, hasTemporaryPassword, onTemporaryPasswordChanged } = useAuth();

  // Only render modal if user is authenticated and has temporary password
  if (!user || !hasTemporaryPassword) {
    return null;
  }

  return (
    <ChangeTemporaryPasswordModal
      isOpen={hasTemporaryPassword}
      onPasswordChanged={onTemporaryPasswordChanged}
      userEmail={user.email || ''}
    />
  );
};