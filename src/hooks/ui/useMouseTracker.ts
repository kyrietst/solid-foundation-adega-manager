/**
 * Hook para rastreamento de mouse para efeitos hero-spotlight
 * Atualiza as variáveis CSS --x e --y com a posição do mouse
 */

import { MouseEvent } from 'react';

export const useMouseTracker = () => {
  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
    (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
  };

  return { handleMouseMove };
};

export default useMouseTracker;