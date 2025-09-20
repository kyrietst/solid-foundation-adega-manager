import { useAuth } from '@/app/providers/AuthContext';

/**
 * Hook para verificar se uma feature flag está ativa para o usuário atual.
 *
 * @param flagName - Nome da feature flag (ex: 'dashboard_enabled', 'sales_enabled')
 * @returns boolean - true se a flag estiver ativa, false caso contrário
 *
 * @example
 * ```tsx
 * const isDashboardEnabled = useFeatureFlag('dashboard_enabled');
 *
 * if (isDashboardEnabled) {
 *   return <DashboardLink />;
 * }
 * ```
 */
export const useFeatureFlag = (flagName: string): boolean => {
  const { user, featureFlags } = useAuth();

  // Se não há usuário logado, retorna false
  if (!user) {
    return false;
  }

  // Admin principal (adm@adega.com) tem acesso a todas as features
  if (user.email === 'adm@adega.com') {
    return true;
  }

  // Se não há feature flags, retorna false
  if (!featureFlags) {
    return false;
  }

  // Retorna o valor da flag específica, ou false se não existir
  return featureFlags[flagName] === true;
};

/**
 * Hook para verificar múltiplas feature flags de uma vez.
 *
 * @param flagNames - Array com nomes das feature flags
 * @returns Record<string, boolean> - Objeto com o status de cada flag
 *
 * @example
 * ```tsx
 * const flags = useFeatureFlags(['dashboard_enabled', 'sales_enabled']);
 *
 * if (flags.dashboard_enabled) {
 *   // Renderizar dashboard
 * }
 * ```
 */
export const useFeatureFlags = (flagNames: string[]): Record<string, boolean> => {
  const { user, featureFlags } = useAuth();

  // Se não há usuário logado, retorna todas as flags como false
  if (!user) {
    return flagNames.reduce((acc, flag) => ({ ...acc, [flag]: false }), {});
  }

  // Admin principal (adm@adega.com) tem acesso a todas as features
  if (user.email === 'adm@adega.com') {
    return flagNames.reduce((acc, flag) => ({ ...acc, [flag]: true }), {});
  }

  // Se não há feature flags, retorna todas como false
  if (!featureFlags) {
    return flagNames.reduce((acc, flag) => ({ ...acc, [flag]: false }), {});
  }

  // Retorna o status de cada flag
  return flagNames.reduce((acc, flag) => ({
    ...acc,
    [flag]: featureFlags[flag] === true
  }), {});
};

// Export por padrão do hook principal
export default useFeatureFlag;