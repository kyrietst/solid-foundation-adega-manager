
import { useCallback, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/core/api/supabase/client';
import { Database } from '@/core/types/supabase';

export type UserRole = Database['public']['Enums']['user_role'];

// Explicit Error Interface for Supabase/Postgrest errors
interface SupabaseError {
    code?: string;
    message: string;
    details?: string;
    hint?: string;
}

interface UseUserProfileReturn {
    userRole: UserRole | null;
    setUserRole: (role: UserRole | null) => void;
    featureFlags: Record<string, boolean> | null;
    setFeatureFlags: (flags: Record<string, boolean> | null) => void;
    hasTemporaryPassword: boolean;
    setHasTemporaryPassword: (val: boolean) => void;
    fetchUserProfile: (currentUser: User) => Promise<void>;
    loadingProfile: boolean;
}

export const useUserProfile = (): UseUserProfileReturn => {
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [featureFlags, setFeatureFlags] = useState<Record<string, boolean> | null>(null);
    const [hasTemporaryPassword, setHasTemporaryPassword] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Refs para evitar loops e chamadas duplicadas
    const currentUserIdRef = useRef<string | null>(null);
    const fetchingProfileRef = useRef(false);

    const fetchUserProfile = useCallback(async (currentUser: User) => {
        // Evitar loops infinitos e chamadas desnecessárias
        if (fetchingProfileRef.current) {
            console.log('🔄 useUserProfile - Já buscando perfil, pulando chamada duplicada');
            return;
        }

        // Evitar busca se já temos os dados para o mesmo usuário
        if (currentUserIdRef.current === currentUser.id && userRole) {
            console.log('🔄 useUserProfile - Perfil já carregado para este usuário, pulando busca');
            return;
        }

        console.log('🔍 useUserProfile - Iniciando busca para:', currentUser.id);
        fetchingProfileRef.current = true;
        currentUserIdRef.current = currentUser.id;
        setLoadingProfile(true);

        // Timeout específico para a busca do perfil (6 segundos)
        const profileTimeout = setTimeout(() => {
            console.warn('⏰ useUserProfile - Timeout de 6s na busca do perfil, forçando fallback');
            fetchingProfileRef.current = false;

            // Fallback seguro
            const isFuncionario = currentUser.email === 'funcionario@adega.com';
            setUserRole('employee');
            setHasTemporaryPassword(false);

            if (isFuncionario) {
                setFeatureFlags({
                    sales_enabled: true,
                    reports_enabled: false,
                    delivery_enabled: false,
                    expenses_enabled: false,
                    customers_enabled: true,
                    dashboard_enabled: false,
                    inventory_enabled: true,
                    movements_enabled: false,
                    suppliers_enabled: false
                });
            } else {
                setFeatureFlags({});
            }
            setLoadingProfile(false);
        }, 6000);

        const fetchProfileOperation = async (retryCount = 0): Promise<void> => {
            try {
                // Se é o admin principal, define o role diretamente (Hardcoded SuperAdmin)
                if (currentUser.email === 'adm@adega.com') {
                    console.log('👤 useUserProfile - Admin principal detectado');
                    setUserRole('admin');
                    setHasTemporaryPassword(false);
                    setFeatureFlags({
                        dashboard_enabled: true,
                        sales_enabled: true,
                        inventory_enabled: true,
                        customers_enabled: true,
                        suppliers_enabled: true,
                        delivery_enabled: true,
                        movements_enabled: true,
                        reports_enabled: true,
                        expenses_enabled: true
                    });
                    return;
                }

                console.log('🔍 useUserProfile - Buscando perfil (tentativa', retryCount + 1, ')');

                const queryPromise = supabase
                    .from('profiles')
                    .select('id, role, is_temporary_password, feature_flags')
                    .filter('id', 'eq', currentUser.id)
                    .single();

                const timeoutPromise = new Promise<{
                    data: null;
                    error: SupabaseError;
                }>((_, reject) =>
                    setTimeout(() => reject(new Error('Profile query timeout')), 10000)
                );

                type ProfileResult =
                    | { data: { role: UserRole | null; is_temporary_password: boolean | null; feature_flags: any } | null; error: SupabaseError | null }
                    | { data: null; error: SupabaseError };

                const result = await Promise.race([queryPromise, timeoutPromise]) as ProfileResult;

                const profileData = result.data;
                const profileError = result.error;

                if (profileError) {
                    // Retry para erro JWT
                    const isJWTError =
                        profileError.code === 'PGRST301' ||
                        profileError.message?.toLowerCase().includes('jwt') ||
                        profileError.message?.toLowerCase().includes('token') ||
                        profileError.message?.toLowerCase().includes('authenticated');

                    if (isJWTError && retryCount === 0) {
                        console.warn('⏳ useUserProfile - Erro de JWT, aguardando 2s para retry...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        return fetchProfileOperation(1);
                    }

                    console.log('⚠️ useUserProfile - Erro na tabela profiles, tentando users table:', profileError);

                    // Fallback para tabela users (Legacy)
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('role')
                        .filter('id', 'eq', currentUser.id)
                        .single();

                    if (userError) {
                        console.error('💥 useUserProfile - Falha em ambas as tabelas.');
                        // Fallback final
                        setUserRole('employee');
                        setHasTemporaryPassword(false);
                        setFeatureFlags({});
                        return;
                    }

                    // Strict type assertion
                    const safeUserData = userData as { role: UserRole };
                    setUserRole(safeUserData.role);
                    setHasTemporaryPassword(false);
                    setFeatureFlags(null);

                } else if (profileData) {
                    console.log('✅ useUserProfile - Perfil encontrado');
                    setUserRole(profileData.role);
                    setHasTemporaryPassword(profileData.is_temporary_password || false);
                    setFeatureFlags((profileData.feature_flags as Record<string, boolean>) || {});
                }

            } catch (error) {
                console.warn('⚠️ useUserProfile - Exceção na busca do perfil:', error);
                // Fallback final de segurança
                setUserRole('employee');
                setHasTemporaryPassword(false);
                setFeatureFlags({});
            }
        };

        try {
            await fetchProfileOperation();
        } finally {
            clearTimeout(profileTimeout);
            fetchingProfileRef.current = false;
            setLoadingProfile(false);
        }
    }, [userRole]);

    return {
        userRole,
        setUserRole,
        featureFlags,
        setFeatureFlags,
        hasTemporaryPassword,
        setHasTemporaryPassword,
        fetchUserProfile,
        loadingProfile
    };
};
