/**
 * Movimentações principal - Implementa padrão Container/Presentational
 * Componente refatorado para usar separação de responsabilidades
 */

import React from 'react';
import { MovementsContainer } from './MovementsContainer';

export const Movements: React.FC = () => {
  return <MovementsContainer />;
};

export default Movements;
