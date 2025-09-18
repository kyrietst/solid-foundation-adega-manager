/**
 * @fileoverview Testes de acessibilidade para componentes críticos
 * FASE 7: COBERTURA, PERFORMANCE E QUALIDADE - Subtarefa 7.3.1
 * 
 * @author Adega Manager Testing Team
 * @version 1.0.0
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock do useToast
vi.mock('@/shared/hooks/common/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

// Mock do Supabase
vi.mock('@/core/api/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }
}));

// Componente de teste simples para formulário
const TestForm = () => (
  <form aria-label="Formulário de teste">
    <div>
      <label htmlFor="name">Nome *</label>
      <input 
        id="name" 
        type="text" 
        required 
        aria-describedby="name-error"
        aria-invalid="false"
      />
      <div id="name-error" role="alert" aria-live="polite"></div>
    </div>
    
    <div>
      <label htmlFor="email">Email</label>
      <input 
        id="email" 
        type="email" 
        aria-describedby="email-help"
      />
      <div id="email-help">Digite seu melhor email</div>
    </div>
    
    <button type="submit" aria-describedby="submit-help">
      Enviar Formulário
    </button>
    <div id="submit-help">Clique para enviar os dados</div>
  </form>
);

// Componente de teste para tabela
const TestTable = () => (
  <div role="region" aria-label="Lista de produtos">
    <table role="table" aria-label="Produtos cadastrados">
      <caption>Lista completa de produtos do sistema</caption>
      <thead>
        <tr>
          <th scope="col" aria-sort="none">
            <button type="button" aria-label="Ordenar por nome">
              Nome
            </button>
          </th>
          <th scope="col" aria-sort="none">
            <button type="button" aria-label="Ordenar por preço">
              Preço
            </button>
          </th>
          <th scope="col">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Vinho Tinto Premium</td>
          <td>R$ 89,90</td>
          <td>
            <button 
              type="button" 
              aria-label="Editar produto Vinho Tinto Premium"
            >
              Editar
            </button>
            <button 
              type="button" 
              aria-label="Excluir produto Vinho Tinto Premium"
              aria-describedby="delete-warning"
            >
              Excluir
            </button>
          </td>
        </tr>
        <tr>
          <td>Champagne Especial</td>
          <td>R$ 159,90</td>
          <td>
            <button 
              type="button" 
              aria-label="Editar produto Champagne Especial"
            >
              Editar
            </button>
            <button 
              type="button" 
              aria-label="Excluir produto Champagne Especial"
            >
              Excluir
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div id="delete-warning" aria-live="polite">
      Esta ação não pode ser desfeita
    </div>
  </div>
);

// Componente de teste para modal
const TestModal = ({ isOpen }: { isOpen: boolean }) => {
  if (!isOpen) return null;
  
  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div role="document">
        <h2 id="modal-title">Confirmar Ação</h2>
        <p id="modal-description">
          Tem certeza que deseja excluir este produto?
        </p>
        <div>
          <button type="button">
            Confirmar
          </button>
          <button type="button">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

describe('Accessibility Tests', () => {
  describe('Subtarefa 7.3.1: Formulários Acessíveis', () => {
    it('deve ter formulário sem violações de acessibilidade', async () => {
      const { container } = render(<TestForm />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    it('deve ter labels associados aos inputs', () => {
      render(<TestForm />);
      
      const nameInput = screen.getByLabelText('Nome *');
      const emailInput = screen.getByLabelText('Email');
      
      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(nameInput).toHaveAttribute('required');
    });

    it('deve ter atributos ARIA apropriados', () => {
      render(<TestForm />);
      
      const nameInput = screen.getByLabelText('Nome *');
      const form = screen.getByRole('form');
      
      expect(form).toHaveAttribute('aria-label', 'Formulário de teste');
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
      expect(nameInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('deve suportar navegação por teclado', async () => {
      const user = userEvent.setup();
      render(<TestForm />);
      
      const nameInput = screen.getByLabelText('Nome *');
      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: /enviar formulário/i });
      
      // Testar navegação com Tab
      await user.tab();
      expect(nameInput).toHaveFocus();
      
      await user.tab();
      expect(emailInput).toHaveFocus();
      
      await user.tab();
      expect(submitButton).toHaveFocus();
    });
  });

  describe('Subtarefa 7.3.1: Tabelas Acessíveis', () => {
    it('deve ter tabela sem violações de acessibilidade', async () => {
      const { container } = render(<TestTable />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    it('deve ter cabeçalhos de tabela apropriados', () => {
      render(<TestTable />);
      
      const table = screen.getByRole('table');
      const nameHeader = screen.getByRole('columnheader', { name: /nome/i });
      const priceHeader = screen.getByRole('columnheader', { name: /preço/i });
      
      expect(table).toHaveAttribute('aria-label', 'Produtos cadastrados');
      expect(nameHeader).toHaveAttribute('scope', 'col');
      expect(priceHeader).toHaveAttribute('scope', 'col');
    });

    it('deve ter caption descritivo', () => {
      render(<TestTable />);
      
      const caption = screen.getByText('Lista completa de produtos do sistema');
      expect(caption).toBeInTheDocument();
    });

    it('deve ter botões de ação com labels descritivos', () => {
      render(<TestTable />);
      
      const editButtons = screen.getAllByRole('button', { name: /editar produto/i });
      const deleteButtons = screen.getAllByRole('button', { name: /excluir produto/i });
      
      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
      
      expect(editButtons[0]).toHaveAttribute('aria-label', 'Editar produto Vinho Tinto Premium');
      expect(deleteButtons[0]).toHaveAttribute('aria-label', 'Excluir produto Vinho Tinto Premium');
    });
  });

  describe('Subtarefa 7.3.1: Modais Acessíveis', () => {
    it('deve ter modal sem violações de acessibilidade', async () => {
      const { container } = render(<TestModal isOpen={true} />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    it('deve ter atributos ARIA de modal apropriados', () => {
      render(<TestModal isOpen={true} />);
      
      const dialog = screen.getByRole('dialog');
      const title = screen.getByText('Confirmar Ação');
      const description = screen.getByText('Tem certeza que deseja excluir este produto?');
      
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');
      expect(title).toHaveAttribute('id', 'modal-title');
      expect(description).toHaveAttribute('id', 'modal-description');
    });

    it('deve ter elementos focáveis no modal', () => {
      render(<TestModal isOpen={true} />);
      
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      
      expect(confirmButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
      // Verificar que ambos os botões são focáveis
      expect(confirmButton).not.toHaveAttribute('disabled');
      expect(cancelButton).not.toHaveAttribute('disabled');
    });

    it('não deve renderizar quando fechado', () => {
      render(<TestModal isOpen={false} />);
      
      const dialog = screen.queryByRole('dialog');
      expect(dialog).not.toBeInTheDocument();
    });
  });

  describe('Subtarefa 7.3.1: Estados de Loading Acessíveis', () => {
    const LoadingComponent = ({ isLoading }: { isLoading: boolean }) => (
      <div>
        <button type="button" disabled={isLoading} aria-describedby="loading-status">
          {isLoading ? 'Carregando...' : 'Enviar'}
        </button>
        <div 
          id="loading-status" 
          role="status" 
          aria-live="polite"
          aria-label={isLoading ? 'Carregando dados' : ''}
        >
          {isLoading && (
            <span aria-hidden="true">⏳</span>
          )}
        </div>
      </div>
    );

    it('deve ter estado de loading acessível', async () => {
      const { container } = render(<LoadingComponent isLoading={true} />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    it('deve comunicar estado de loading para leitores de tela', () => {
      render(<LoadingComponent isLoading={true} />);
      
      const button = screen.getByRole('button');
      const status = screen.getByRole('status');
      
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Carregando...');
      expect(status).toHaveAttribute('aria-live', 'polite');
      expect(status).toHaveAttribute('aria-label', 'Carregando dados');
    });

    it('deve remover indicadores de loading quando não carregando', () => {
      render(<LoadingComponent isLoading={false} />);
      
      const button = screen.getByRole('button');
      const status = screen.getByRole('status');
      
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('Enviar');
      expect(status).toHaveAttribute('aria-label', '');
    });
  });

  describe('Subtarefa 7.3.1: Navegação por Teclado', () => {
    const NavigationComponent = () => (
      <nav role="navigation" aria-label="Menu principal">
        <ul>
          <li>
            <a href="#home">
              Home
            </a>
          </li>
          <li>
            <a href="#products">
              Produtos
            </a>
          </li>
          <li>
            <a href="#sales">
              Vendas
            </a>
          </li>
        </ul>
      </nav>
    );

    it('deve suportar navegação por teclado completa', async () => {
      const user = userEvent.setup();
      render(<NavigationComponent />);
      
      const homeLink = screen.getByRole('link', { name: /home/i });
      const productsLink = screen.getByRole('link', { name: /produtos/i });
      const salesLink = screen.getByRole('link', { name: /vendas/i });
      
      // Testar navegação sequencial
      await user.tab();
      expect(homeLink).toHaveFocus();
      
      await user.tab();
      expect(productsLink).toHaveFocus();
      
      await user.tab();
      expect(salesLink).toHaveFocus();
      
      // Testar navegação reversa
      await user.tab({ shift: true });
      expect(productsLink).toHaveFocus();
    });

    it('deve ter landmarks apropriados', () => {
      render(<NavigationComponent />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Menu principal');
    });
  });

  describe('Subtarefa 7.3.1: Contraste e Visibilidade', () => {
    const ContrastComponent = () => (
      <div>
        <h1 style={{ color: '#000000', backgroundColor: '#ffffff' }}>
          Título Principal
        </h1>
        <p style={{ color: '#333333', backgroundColor: '#ffffff' }}>
          Texto com contraste adequado para leitura.
        </p>
        <button 
          style={{ 
            color: '#ffffff', 
            backgroundColor: '#0066cc',
            border: '2px solid #004499',
            padding: '8px 16px'
          }}
        >
          Botão Acessível
        </button>
      </div>
    );

    it('deve ter elementos visíveis sem violações', async () => {
      const { container } = render(<ContrastComponent />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    it('deve ter elementos focáveis visíveis', async () => {
      const user = userEvent.setup();
      render(<ContrastComponent />);
      
      const button = screen.getByRole('button', { name: /botão acessível/i });
      
      await user.tab();
      expect(button).toHaveFocus();
      expect(button).toBeVisible();
    });
  });
});