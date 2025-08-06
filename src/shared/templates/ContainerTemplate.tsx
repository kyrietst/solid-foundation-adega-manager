/**
 * Template padrão para componentes Container
 * Use este template como base para criar novos containers
 */

import React from 'react';
// import { useYourLogicHook } from '@/hooks/your-domain/useYourLogicHook';
// import { YourPresentation } from './YourPresentation';

// 1. Defina a interface para as props do container
export interface YourContainerProps {
  // Props que vêm do componente pai
  // Exemplo: initialData?, onSuccess?, onCancel?, etc.
}

export const YourContainer: React.FC<YourContainerProps> = ({
  // Desestruture as props aqui
}) => {
  // 2. Use hooks para lógica de negócio
  // const {
  //   // Dados
  //   data,
  //   isLoading,
  //   
  //   // Estados
  //   formData,
  //   validation,
  //   
  //   // Ações
  //   handleSubmit,
  //   handleCancel,
  // } = useYourLogicHook(config);

  // 3. Preparar props para o componente de apresentação
  const presentationProps = {
    // Dados processados
    // data,
    // isLoading,
    
    // Estados
    // formData,
    // validation,
    
    // Configuração
    // config,
    
    // Handlers (sempre prefixar com 'on')
    // onSubmit: handleSubmit,
    // onCancel: handleCancel,
  };

  // 4. Renderizar apenas o componente de apresentação
  // return <YourPresentation {...presentationProps} />;
  return <div>Container Template - Replace with your implementation</div>;
};

/**
 * CHECKLIST PARA CRIAR UM NOVO CONTAINER:
 * 
 * □ 1. Defina as props de entrada (YourContainerProps)
 * □ 2. Crie/use hooks para lógica de negócio
 * □ 3. Processe os dados no formato necessário para apresentação
 * □ 4. Passe apenas dados processados para o componente de apresentação
 * □ 5. NÃO inclua JSX complexo - apenas coordenação
 * □ 6. Prefixe handlers com 'on' (onSubmit, onCancel, onChange, etc.)
 * □ 7. Mantenha o container focado apenas em lógica e coordenação
 * 
 * EXEMPLO DE USO:
 * 
 * // No componente pai
 * <YourContainer 
 *   initialData={data}
 *   onSuccess={handleSuccess}
 *   onCancel={handleCancel}
 * />
 */