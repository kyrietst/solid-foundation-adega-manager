/**
 * @fileoverview Testes para utilitários de formatação e helpers
 * FASE 6: TESTES DE UTILITÁRIOS E HELPERS
 * 
 * @author Adega Manager Testing Team
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';
import { formatCurrency, cn } from '../utils';

describe('formatCurrency', () => {
  describe('Subtarefa 6.1.1: Formatação Monetária - Valores Positivos', () => {
    it('deve formatar valores monetários brasileiros corretamente', () => {
      expect(formatCurrency(1234.56)).toBe('R$\u00A01.234,56');
      expect(formatCurrency(29.90)).toBe('R$\u00A029,90');
      expect(formatCurrency(1000)).toBe('R$\u00A01.000,00');
    });

    it('deve formatar valores pequenos corretamente', () => {
      expect(formatCurrency(0.01)).toBe('R$\u00A00,01');
      expect(formatCurrency(0.99)).toBe('R$\u00A00,99');
      expect(formatCurrency(1.23)).toBe('R$\u00A01,23');
    });

    it('deve formatar valores grandes corretamente', () => {
      expect(formatCurrency(1234567.89)).toBe('R$\u00A01.234.567,89');
      expect(formatCurrency(1000000)).toBe('R$\u00A01.000.000,00');
    });
  });

  describe('Subtarefa 6.1.1: Formatação Monetária - Valores Negativos', () => {
    it('deve formatar valores negativos corretamente', () => {
      expect(formatCurrency(-100)).toBe('-R$\u00A0100,00');
      expect(formatCurrency(-1234.56)).toBe('-R$\u00A01.234,56');
      expect(formatCurrency(-0.01)).toBe('-R$\u00A00,01');
    });

    it('deve manter formatação brasileira para valores negativos', () => {
      expect(formatCurrency(-29.90)).toBe('-R$\u00A029,90');
      expect(formatCurrency(-1000000)).toBe('-R$\u00A01.000.000,00');
    });
  });

  describe('Subtarefa 6.1.1: Formatação Monetária - Zero e Edge Cases', () => {
    it('deve formatar zero corretamente', () => {
      expect(formatCurrency(0)).toBe('R$\u00A00,00');
      expect(formatCurrency(-0)).toBe('-R$\u00A00,00');
    });

    it('deve lidar com valores com muitas casas decimais', () => {
      // JavaScript automaticamente arredonda para 2 casas decimais em currency
      expect(formatCurrency(29.999)).toBe('R$\u00A030,00');
      expect(formatCurrency(29.994)).toBe('R$\u00A029,99');
      expect(formatCurrency(29.995)).toBe('R$\u00A030,00');
    });

    it('deve lidar com valores muito pequenos', () => {
      expect(formatCurrency(0.001)).toBe('R$\u00A00,00');
      expect(formatCurrency(0.004)).toBe('R$\u00A00,00');
      expect(formatCurrency(0.005)).toBe('R$\u00A00,01');
    });
  });

  describe('Property-based Tests: Invariantes de Formatação', () => {
    it('deve sempre retornar string que começa com R$ ou -R$', () => {
      const testValues = [0, 1, -1, 100, -100, 1234.56, -9876.54];
      
      testValues.forEach(value => {
        const formatted = formatCurrency(value);
        expect(formatted).toMatch(/^-?R\$\u00A0/);
      });
    });

    it('deve sempre incluir vírgula como separador decimal', () => {
      const testValues = [1.5, 100.99, 1234.56, -29.90];
      
      testValues.forEach(value => {
        const formatted = formatCurrency(value);
        expect(formatted).toMatch(/,\d{2}$/); // Termina com vírgula e 2 dígitos
      });
    });

    it('deve usar ponto como separador de milhares quando aplicável', () => {
      expect(formatCurrency(1234)).toContain('1.234');
      expect(formatCurrency(1234567)).toContain('1.234.567');
      expect(formatCurrency(-1234567.89)).toContain('1.234.567');
    });
  });
});

describe('cn - Utility para classes CSS', () => {
  it('deve combinar classes CSS corretamente', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('deve lidar com classes condicionais', () => {
    expect(cn('base', true && 'conditional', false && 'ignored')).toBe('base conditional');
  });

  it('deve resolver conflitos de Tailwind CSS', () => {
    // tw-merge deve resolver conflitos de classes similares
    const result = cn('p-4', 'p-6'); // p-6 deve prevalecer
    expect(result).toBe('p-6');
  });

  it('deve lidar com valores undefined/null', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
  });
});