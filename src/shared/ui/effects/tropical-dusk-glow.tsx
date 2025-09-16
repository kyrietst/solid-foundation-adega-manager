import React from 'react';

/**
 * TropicalDuskGlow - Background otimizado para performance
 *
 * Substitui o fluid-blob que estava causando travamentos no computador da cliente.
 * Usa apenas CSS puro com gradientes radiais estáticos, adaptado para o tema wine cellar.
 *
 * Performance improvements:
 * - Zero JavaScript execution durante render
 * - Sem WebGL ou shaders custosos
 * - Sem animações que consomem CPU/GPU
 * - CSS nativo do navegador com aceleração de hardware
 */
export const TropicalDuskGlow: React.FC = () => {
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        background: '#000000', // Fundo preto base mantido do tema
        backgroundImage: `
          radial-gradient(circle at 50% 100%, rgba(139, 69, 19, 0.6) 0%, transparent 60%),
          radial-gradient(circle at 50% 100%, rgba(184, 134, 11, 0.4) 0%, transparent 70%),
          radial-gradient(circle at 50% 100%, rgba(101, 63, 13, 0.3) 0%, transparent 80%),
          radial-gradient(circle at 30% 80%, rgba(120, 53, 15, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 70% 85%, rgba(146, 64, 14, 0.25) 0%, transparent 55%)
        `,
        // Otimizações de performance
        willChange: 'auto', // Remove will-change desnecessário
        transform: 'translateZ(0)', // Force hardware acceleration uma vez
        backfaceVisibility: 'hidden', // Otimização de renderização
      }}
      aria-hidden="true" // Acessibilidade: elemento puramente decorativo
    />
  );
};

export default TropicalDuskGlow;