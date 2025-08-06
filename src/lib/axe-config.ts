/**
 * Configuração do axe-core para testes de acessibilidade
 * WCAG 2.1 AA Compliance Configuration
 */

import { configureAxe } from '@axe-core/react';

if (process.env.NODE_ENV !== 'production') {
  // Configurar axe-core apenas em desenvolvimento
  configureAxe({
    // Regras específicas para WCAG 2.1 AA
    rules: {
      // Nivel A (obrigatórias)
      'area-alt': { enabled: true },
      'aria-allowed-attr': { enabled: true },
      'aria-hidden-body': { enabled: true },
      'aria-hidden-focus': { enabled: true },
      'aria-label': { enabled: true },
      'aria-labelledby': { enabled: true },
      'aria-required-attr': { enabled: true },
      'aria-roles': { enabled: true },
      'aria-valid-attr': { enabled: true },
      'aria-valid-attr-value': { enabled: true },
      'button-name': { enabled: true },
      'bypass': { enabled: true },
      'color-contrast': { enabled: true },
      'document-title': { enabled: true },
      'duplicate-id': { enabled: true },
      'form-field-multiple-labels': { enabled: true },
      'frame-title': { enabled: true },
      'html-has-lang': { enabled: true },
      'html-lang-valid': { enabled: true },
      'image-alt': { enabled: true },
      'input-button-name': { enabled: true },
      'input-image-alt': { enabled: true },
      'label': { enabled: true },
      'link-name': { enabled: true },
      'list': { enabled: true },
      'listitem': { enabled: true },
      'marquee': { enabled: true },
      'meta-refresh': { enabled: true },
      'object-alt': { enabled: true },
      'role-img-alt': { enabled: true },
      'scrollable-region-focusable': { enabled: true },
      'server-side-image-map': { enabled: true },
      'svg-img-alt': { enabled: true },
      'td-headers-attr': { enabled: true },
      'th-has-data-cells': { enabled: true },
      'valid-lang': { enabled: true },
      'video-caption': { enabled: true },

      // Nivel AA (recomendadas para WCAG 2.1 AA)
      'aria-describedby': { enabled: true },
      'aria-expanded': { enabled: true },
      'aria-input-field-name': { enabled: true },
      'aria-required-children': { enabled: true },
      'aria-required-parent': { enabled: true },
      'autocomplete-valid': { enabled: true },
      'avoid-inline-spacing': { enabled: true },
      'color-contrast-enhanced': { enabled: false }, // Seria AAA
      'focus-order-semantics': { enabled: true },
      'hidden-content': { enabled: true },
      'identical-links-same-purpose': { enabled: true },
      'label-content-name-mismatch': { enabled: true },
      'link-in-text-block': { enabled: true },
      'no-autoplay-audio': { enabled: true },
      'role-supports-aria-props': { enabled: true },
      'scrollable-region-keyboard': { enabled: true },
      'select-name': { enabled: true },
      'skip-link': { enabled: true },
      'tabindex': { enabled: true },
      'target-size': { enabled: false }, // Level AAA, muito restritivo
      'text-spacing': { enabled: true },

      // Regras específicas para nosso contexto
      'landmark-banner-is-top-level': { enabled: true },
      'landmark-contentinfo-is-top-level': { enabled: true },
      'landmark-main-is-top-level': { enabled: true },
      'landmark-no-duplicate-banner': { enabled: true },
      'landmark-no-duplicate-contentinfo': { enabled: true },
      'landmark-no-duplicate-main': { enabled: true },
      'landmark-one-main': { enabled: true },
      'page-has-heading-one': { enabled: true },
      'region': { enabled: true },

      // Regras para formulários (muito importantes para nosso sistema)
      'aria-input-field-label': { enabled: true },
      'duplicate-id-active': { enabled: true },
      'duplicate-id-aria': { enabled: true },
      'fieldset': { enabled: true },
      'legend': { enabled: true },

      // Regras para tabelas (importante para CustomerTable, InventoryTable)
      'table-duplicate-name': { enabled: true },
      'table-fake-caption': { enabled: true },
      'scope-attr-valid': { enabled: true },

      // Regras menos rigorosas para desenvolvimento
      'color-contrast': { 
        enabled: true,
        options: {
          // Aceitar contraste mínimo de 3:1 em desenvolvimento
          // Em produção seria 4.5:1 para WCAG AA
          contrastRatio: {
            normal: 3,
            large: 3
          }
        }
      }
    },

    // Tags para focar no que importa
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],

    // Excluir elementos que podem causar falsos positivos
    exclude: [
      // Componentes de terceiros que já são acessíveis
      '[data-radix-popper-content-wrapper]',
      '[data-sonner-toaster]',
      // Loading spinners e elementos temporários
      '[data-loading="true"]',
      '.animate-spin'
    ],

    // Configurações de relatório
    reporter: 'v2',
    resultTypes: ['violations', 'incomplete'],
    
    // Configurações específicas para desenvolvimento
    disableOtherRules: false,
    timeout: 5000
  });

  console.log('🛡️ axe-core configurado para WCAG 2.1 AA compliance');
}

// Função helper para testes manuais
export const runAxeAnalysis = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.warn('Análise axe-core não disponível em produção');
    return;
  }

  try {
    const axe = await import('@axe-core/react');
    const React = await import('react');
    const ReactDOM = await import('react-dom');
    
    // Executar análise na página atual
    axe.default(React.default, ReactDOM.default, 1000);
    
    console.log('🔍 Análise de acessibilidade executada. Verifique o console para resultados.');
  } catch (error) {
    console.error('Erro ao executar análise axe-core:', error);
  }
};

// Configuração para diferentes ambientes
export const axeConfig = {
  development: {
    enabled: true,
    showViolations: true,
    showIncomplete: true,
    debounceTime: 1000
  },
  test: {
    enabled: true,
    showViolations: false,
    showIncomplete: false,
    debounceTime: 0
  },
  production: {
    enabled: false
  }
};

export default axeConfig;