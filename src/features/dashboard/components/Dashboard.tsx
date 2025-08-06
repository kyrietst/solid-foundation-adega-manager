/**
 * Dashboard principal - Implementa padrão Container/Presentational
 * Componente refatorado para usar separação de responsabilidades
 */

import React from 'react';
import { DashboardContainer } from './DashboardContainer';

const Dashboard = () => {
  return <DashboardContainer />;
};

export default Dashboard;