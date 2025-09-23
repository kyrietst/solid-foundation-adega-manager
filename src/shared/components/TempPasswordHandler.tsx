/**
 * Component responsible for handling temporary password changes
 * Shows the mandatory password change modal when user has a temporary password
 * ✅ OTIMIZADO: Implementa debounce para evitar flash de modal
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { ChangeTemporaryPasswordModal } from '@/features/users/components/ChangeTemporaryPasswordModal';

export const TempPasswordHandler: React.FC = () => {
  const { user, hasTemporaryPassword, onTemporaryPasswordChanged } = useAuth();
  const [shouldShowModal, setShouldShowModal] = useState(false);

  // ✅ DEBOUNCE: Implementa delay para evitar flash de modal
  useEffect(() => {
    if (!user) {
      setShouldShowModal(false);
      return;
    }

    if (hasTemporaryPassword) {
      // Delay mínimo para evitar flash durante login
      const timer = setTimeout(() => {
        setShouldShowModal(true);
      }, 500); // 500ms delay para estabilizar estado

      return () => clearTimeout(timer);
    } else {
      // Remover modal imediatamente quando senha não é mais temporária
      setShouldShowModal(false);
    }
  }, [user, hasTemporaryPassword]);

  // ✅ OTIMIZADO: Renderização condicional mais inteligente
  if (!user || !shouldShowModal) {
    return null;
  }

  console.log('🔐 TempPasswordHandler - Mostrando modal de senha temporária');

  return (
    <ChangeTemporaryPasswordModal
      isOpen={shouldShowModal}
      onPasswordChanged={() => {
        setShouldShowModal(false);
        onTemporaryPasswordChanged();
      }}
      userEmail={user.email || ''}
    />
  );
};