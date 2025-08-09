/**
 * Template padrão para componentes Presentation
 * Use este template como base para criar novos componentes de apresentação
 */

import React from 'react';
// Import de sub-componentes necessários
// import { YourSubComponent } from './YourSubComponent';

// 1. Defina a interface para as props de apresentação
export interface YourPresentationProps {
  // Dados processados (sempre readonly/imutáveis)
  // data: readonly YourDataType[];
  // isLoading: boolean;
  
  // Estados (sempre readonly)
  // formData: Readonly<YourFormData>;
  // validation: Readonly<ValidationResult>;
  
  // Configuração (sempre readonly)
  // config: Readonly<YourConfig>;
  
  // Handlers (sempre prefixados com 'on')
  // onSubmit: (data: YourDataType) => void;
  // onCancel: () => void;
  // onChange: (field: string, value: any) => void;
}

export const YourPresentation: React.FC<YourPresentationProps> = ({
  // Desestruture todas as props aqui
  // data,
  // isLoading,
  // formData,
  // validation,
  // config,
  // onSubmit,
  // onCancel,
  // onChange,
}) => {
  // 2. NÃO inclua lógica de negócio aqui
  // - Sem useState para dados de negócio
  // - Sem useEffect para side effects
  // - Sem queries ou mutations
  // - Sem cálculos complexos

  // 3. Apenas lógica de apresentação simples é permitida
  // const isEmpty = data.length === 0;
  // const hasErrors = validation.errors.length > 0;

  return (
    <div className="your-component-styles">
      {/* 4. Estrutura JSX focada apenas em apresentação */}
      
      {/* Loading state */}
      {/* {isLoading && <LoadingSpinner />} */}
      
      {/* Empty state */}
      {/* {isEmpty && !isLoading && <EmptyState />} */}
      
      {/* Main content */}
      {/* <YourSubComponent 
        data={data}
        onAction={onSubmit}
      /> */}
      
      <div>Presentation Template - Replace with your implementation</div>
    </div>
  );
};

/**
 * CHECKLIST PARA CRIAR UM NOVO COMPONENTE DE APRESENTAÇÃO:
 * 
 * □ 1. Defina props tipadas e readonly quando possível
 * □ 2. NÃO inclua lógica de negócio (sem useState de dados, sem useEffect, etc.)
 * □ 3. Apenas lógica de apresentação simples (isEmpty, hasErrors, etc.)
 * □ 4. Use sub-componentes para dividir responsabilidades
 * □ 5. Handlers sempre recebidos via props (prefixados com 'on')
 * □ 6. Focado apenas em renderização e user interface
 * □ 7. Fácil de testar isoladamente
 * 
 * EXEMPLO DE ESTRUTURA:
 * 
 * return (
 *   <div className="container">
 *     {/* Header */}
 *     <YourHeader title="Title" />
 *     
 *     {/* Main content baseado no estado */}
 *     {isLoading ? (
 *       <LoadingState />
 *     ) : isEmpty ? (
 *       <EmptyState />
 *     ) : (
 *       <YourMainContent 
 *         data={data}
 *         onAction={onAction}
 *       />
 *     )}
 *     
 *     {/* Footer/Actions */}
 *     <YourActions 
 *       onSubmit={onSubmit}
 *       onCancel={onCancel}
 *       disabled={hasErrors}
 *     />
 *   </div>
 * );
 * 
 * VANTAGENS DESTA ABORDAGEM:
 * - Fácil de testar (apenas props → JSX)
 * - Reutilizável em diferentes contextos
 * - Sem side effects ou estado interno
 * - Performance otimizada (React.memo friendly)
 * - Manutenção simplificada
 */