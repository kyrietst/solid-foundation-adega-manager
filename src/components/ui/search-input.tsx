import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
  const styles = sizeStyles[size];

  // Debounce effect
  useEffect(() => {
    if (debounceMs > 0) {
      const timer = setTimeout(() => {
        onChange(internalValue);
      }, debounceMs);

      return () => clearTimeout(timer);
    } else {
      onChange(internalValue);
    }
  }, [internalValue, onChange, debounceMs]);

  // Sync external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  return (
    <div className={cn('relative', className)}>
      <Search className={cn(
        'absolute top-1/2 transform -translate-y-1/2 text-muted-foreground',
        styles.icon
      )} />
      
      <Input
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(styles.input)}
      />
      
      {showClearButton && internalValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={disabled}
          className={cn(
            'absolute top-1/2 transform -translate-y-1/2 p-0 hover:bg-transparent',
            styles.clear
          )}
        >
          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </Button>
      )}
    </div>
  );
};