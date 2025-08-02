/**
 * Dashboard principal - Implementa padrão Container/Presentational
 * Componente refatorado para usar separação de responsabilidades
 */

import React from 'react';
import { DashboardContainer } from './dashboard/DashboardContainer';

export const Dashboard = () => {
  return <DashboardContainer />;
};