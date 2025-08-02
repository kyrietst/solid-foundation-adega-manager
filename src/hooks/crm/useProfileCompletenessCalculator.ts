/**
 * Hook especializado para cálculo de completude de perfil do cliente
 * Extraído de use-crm.ts para melhor organização e testabilidade
 */

import { useState, useEffect, useCallback } from 'react';
import { CustomerProfile } from '@/hooks/use-crm';

export interface ProfileCompletenessField {
  name: keyof CustomerProfile;
  label: string;
  weight: number;
  required: boolean;
}

export interface ProfileCompleteness {
  score: number;
  suggestions: string[];
  percentage: number;
  requiredFieldsMissing: string[];
  optionalFieldsMissing: string[];
}

// Configuração dos campos para cálculo de completude
const PROFILE_FIELDS: ProfileCompletenessField[] = [
  { name: 'name', label: 'Nome', weight: 15, required: true },
  { name: 'phone', label: 'Telefone', weight: 15, required: true },
  { name: 'email', label: 'Email', weight: 10, required: false },
  { name: 'address', label: 'Endereço', weight: 10, required: false },
  { name: 'birthday', label: 'Data de aniversário', weight: 10, required: false },
  { name: 'contact_preference', label: 'Preferência de contato', weight: 10, required: false },
  { name: 'contact_permission', label: 'Permissão de contato', weight: 15, required: true },
  { name: 'notes', label: 'Observações', weight: 5, required: false },
];

const MAX_SCORE = PROFILE_FIELDS.reduce((sum, field) => sum + field.weight, 0);

/**
 * Hook para calcular completude de perfil de cliente
 * @param customer - Dados do cliente para análise
 * @returns Dados de completude com score, sugestões e detalhes
 */
export const useProfileCompletenessCalculator = (customer?: CustomerProfile | null): ProfileCompleteness => {
  const [completeness, setCompleteness] = useState<ProfileCompleteness>({
    score: 0,
    suggestions: [],
    percentage: 0,
    requiredFieldsMissing: [],
    optionalFieldsMissing: []
  });

  // Função de cálculo memoizada
  const calculateCompleteness = useCallback((customerData: CustomerProfile): ProfileCompleteness => {
    let score = 0;
    const suggestions: string[] = [];
    const requiredFieldsMissing: string[] = [];
    const optionalFieldsMissing: string[] = [];

    PROFILE_FIELDS.forEach(field => {
      const fieldValue = customerData[field.name];
      const hasValue = fieldValue !== null && fieldValue !== undefined && fieldValue !== '';

      if (hasValue) {
        score += field.weight;
      } else {
        if (field.required) {
          suggestions.push(`Adicionar ${field.label}`);
          requiredFieldsMissing.push(field.label);
        } else {
          suggestions.push(`Completar ${field.label}`);
          optionalFieldsMissing.push(field.label);
        }
      }
    });

    // Limitar sugestões principais (campos obrigatórios primeiro)
    const prioritizedSuggestions = [
      ...suggestions.filter(s => s.startsWith('Adicionar')),
      ...suggestions.filter(s => s.startsWith('Completar'))
    ].slice(0, 3);

    const percentage = Math.round((score / MAX_SCORE) * 100);

    return {
      score,
      suggestions: prioritizedSuggestions,
      percentage,
      requiredFieldsMissing,
      optionalFieldsMissing
    };
  }, []);

  // Recalcular quando customer muda
  useEffect(() => {
    if (!customer) {
      setCompleteness({
        score: 0,
        suggestions: [],
        percentage: 0,
        requiredFieldsMissing: [],
        optionalFieldsMissing: []
      });
      return;
    }

    const result = calculateCompleteness(customer);
    setCompleteness(result);
  }, [customer, calculateCompleteness]);

  return completeness;
};

/**
 * Hook para calcular completude de múltiplos clientes
 * @param customers - Array de clientes
 * @returns Estatísticas agregadas de completude
 */
export const useBulkProfileCompleteness = (customers: CustomerProfile[] = []) => {
  const [stats, setStats] = useState({
    averageCompleteness: 0,
    highCompleteness: 0, // > 80%
    mediumCompleteness: 0, // 50-80%
    lowCompleteness: 0, // < 50%
    totalCustomers: 0
  });

  useEffect(() => {
    if (customers.length === 0) {
      setStats({
        averageCompleteness: 0,
        highCompleteness: 0,
        mediumCompleteness: 0,
        lowCompleteness: 0,
        totalCustomers: 0
      });
      return;
    }

    let totalScore = 0;
    let high = 0, medium = 0, low = 0;

    customers.forEach(customer => {
      const score = PROFILE_FIELDS.reduce((sum, field) => {
        const fieldValue = customer[field.name];
        const hasValue = fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
        return sum + (hasValue ? field.weight : 0);
      }, 0);

      const percentage = (score / MAX_SCORE) * 100;
      totalScore += percentage;

      if (percentage > 80) high++;
      else if (percentage >= 50) medium++;
      else low++;
    });

    setStats({
      averageCompleteness: Math.round(totalScore / customers.length),
      highCompleteness: high,
      mediumCompleteness: medium,
      lowCompleteness: low,
      totalCustomers: customers.length
    });
  }, [customers]);

  return stats;
};

// Utility para validar se perfil está completo
export const isProfileComplete = (customer: CustomerProfile): boolean => {
  return PROFILE_FIELDS
    .filter(field => field.required)
    .every(field => {
      const value = customer[field.name];
      return value !== null && value !== undefined && value !== '';
    });
};

// Utility para obter próximo campo sugerido
export const getNextSuggestedField = (customer: CustomerProfile): ProfileCompletenessField | null => {
  // Priorizar campos obrigatórios
  const missingRequired = PROFILE_FIELDS
    .filter(field => field.required)
    .find(field => {
      const value = customer[field.name];
      return value === null || value === undefined || value === '';
    });

  if (missingRequired) return missingRequired;

  // Depois campos opcionais por peso
  const missingOptional = PROFILE_FIELDS
    .filter(field => !field.required)
    .sort((a, b) => b.weight - a.weight)
    .find(field => {
      const value = customer[field.name];
      return value === null || value === undefined || value === '';
    });

  return missingOptional || null;
};