import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Iridescence from './iridescence.jsx';

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

export const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ children }) => {
  const { user } = useAuth();

  // Se o usuário não estiver logado, não mostra o background iridescente
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen w-full">
      {/* Background iridescente do React Bits - apenas após login */}
      <div className="fixed inset-0 z-0">
        <Iridescence 
          color={[0.6, 0.4, 1.0]}  // Cor roxa/azul elegante
          speed={0.8}              // Velocidade moderada
          amplitude={0.15}         // Amplitude para reação ao mouse
          mouseReact={true}        // Habilita reação ao mouse
        />
      </div>
      
      {/* Conteúdo da aplicação */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BackgroundWrapper;