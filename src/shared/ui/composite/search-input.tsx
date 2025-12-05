import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/shared/ui/primitives/input';
import { Search, X } from 'lucide-react';
import { cn, getGlassInputClasses, getSearchInputClasses } from '@/core/config/theme-utils';
import { Button } from '@/shared/ui/primitives/button';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  showClearButton?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: {
    input: 'h-8 pl-8 pr-8 text-sm',
    icon: 'h-3 w-3 left-2.5',
    clear: 'h-6 w-6 right-1'
  },
  md: {
    input: 'h-10 pl-10 pr-10',
    icon: 'h-4 w-4 left-3',
    clear: 'h-8 w-8 right-1'
  },
  lg: {
    input: 'h-12 pl-12 pr-12',
    icon: 'h-5 w-5 left-3.5',
    clear: 'h-10 w-10 right-1'
  }
};

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  className,
  debounceMs = 0,
  showClearButton = true,
  disabled = false,
  size = 'md'
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const styles = sizeStyles[size];

  // Estabilizar onChange para evitar re-execuções desnecessárias do useEffect
  const stableOnChange = useCallback(onChange, [onChange]);

  // Debounce effect otimizado
  useEffect(() => {
    if (debounceMs > 0) {
      const timer = setTimeout(() => {
        stableOnChange(internalValue);
      }, debounceMs);

      return () => clearTimeout(timer);
    } else {
      stableOnChange(internalValue);
    }
  }, [internalValue, stableOnChange, debounceMs]);

  // Sync external value changes with protection against race conditions
  useEffect(() => {
    // Se estiver focado e o valor interno já "contém" o novo valor (ex: usuário digitou mais rápido que o refresh),
    // ignoramos a atualização externa para evitar "flicker" (cursor pular ou texto sumir).
    if (isFocused && internalValue.startsWith(value) && internalValue.length > value.length) {
      return;
    }
    setInternalValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); // Removido isFocused/internalValue das deps para evitar loops, confiamos no closure atualizado pelo re-render

  const handleClear = useCallback(() => {
    setInternalValue('');
    stableOnChange('');
  }, [stableOnChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  }, []);

  return (
    <div className={cn('relative', className)}>
      <Search className={cn(
        'absolute top-1/2 transform -translate-y-1/2 text-gray-400',
        styles.icon
      )} />

      <Input
        value={internalValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={placeholder}
        className={cn(
          getGlassInputClasses('search'),
          styles.input,
          'placeholder:text-gray-500'
        )}
      />

      {showClearButton && internalValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={disabled}
          className={cn(
            'absolute top-1/2 transform -translate-y-1/2 p-0 hover:bg-gray-800/60 hover:backdrop-blur-sm rounded-full',
            styles.clear
          )}
        >
          <X className="h-3 w-3 text-gray-400 hover:text-gray-100 transition-colors duration-200" />
        </Button>
      )}
    </div>
  );
};