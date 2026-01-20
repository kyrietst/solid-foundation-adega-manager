import React from 'react';
import { Package, Plus, Minus, Box, Warehouse } from 'lucide-react';
import { cn } from '@/core/config/utils';

interface StockCounterInputProps {
  label: string;
  icon?: React.ReactNode;
  subtitle?: string;
  value: number;
  onChange: (value: number) => void;
  systemStock: number;
  min?: number;
}

export const StockCounterInput: React.FC<StockCounterInputProps> = ({
  label,
  icon,
  subtitle,
  value,
  onChange,
  systemStock,
  min = 0,
}) => {
  const diff = value - systemStock;
  const isPending = diff !== 0;

  const handleIncrement = () => onChange(value + 1);
  const handleDecrement = () => onChange(Math.max(min, value - 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    onChange(Math.max(min, newValue));
  };

  return (
    <div className="flex flex-col gap-2 group">
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
          {icon || <Box className="text-zinc-500 w-4 h-4" />}
          {label}
        </label>
        {subtitle && <span className="text-sm text-zinc-500">{subtitle}</span>}
      </div>

      <div className="flex items-stretch gap-2 h-24">
        {/* Minus Button */}
        <button
          type="button"
          onClick={handleDecrement}
          className="w-20 bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 rounded-lg flex items-center justify-center transition-all active:scale-95 active:border-red-500"
        >
          <Minus className="w-8 h-8" />
        </button>

        {/* Display Input */}
        <div className="flex-1 bg-zinc-900 border border-zinc-800 group-focus-within:border-emerald-500/50 rounded-lg flex items-center justify-center relative overflow-hidden transition-colors">
          {/* Background grid removed for cleaner look */}
          <input
            className="w-full h-full bg-transparent text-center text-4xl font-semibold text-white focus:outline-none z-10 placeholder-zinc-700 appearance-none m-0"
            type="number"
            value={value}
            onChange={handleChange}
            min={min}
          />
        </div>

        {/* Plus Button */}
        <button
          type="button"
          onClick={handleIncrement}
          className="w-20 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-500 rounded-lg flex items-center justify-center transition-all active:scale-95 active:border-emerald-500"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Reference Meta */}
      <div className="flex justify-between items-center px-2 mt-2">
        <p className="text-zinc-500 text-sm">
          Atual: <span className="text-zinc-300">{systemStock}</span>
        </p>
        
        {isPending ? (
           <p className={cn(
             "text-sm font-medium",
             diff > 0 ? "text-emerald-500" : "text-rose-500"
           )}>
             {diff > 0 ? `+${diff}` : diff}
           </p>
        ) : (
          <p className="text-zinc-600 text-sm">Sem alteração</p>
        )}
      </div>
    </div>
  );
};
