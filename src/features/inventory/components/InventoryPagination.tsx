import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/core/config/utils';

export interface InventoryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  totalItems: number;
  itemsPerPage: number;
}

export const InventoryPagination: React.FC<InventoryPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  totalItems,
  itemsPerPage
}) => {
  
  // Safe validation
  const safeCurrent = Math.max(1, Number(currentPage) || 1);
  const safeTotal = Math.max(1, Number(totalPages) || 1);

  if (safeTotal <= 1) return null;

  const startItem = (safeCurrent - 1) * itemsPerPage + 1;
  const endItem = Math.min(safeCurrent * itemsPerPage, totalItems);

  // Robust sliding window logic
  const getVisiblePages = () => {
    const delta = 2; // Pages to show on each side of current
    const range = [];
    const rangeWithDots: (number | string)[] = [];

    for (let i = Math.max(2, safeCurrent - delta); i <= Math.min(safeTotal - 1, safeCurrent + delta); i++) {
      range.push(i);
    }

    if (safeCurrent - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    range.forEach(i => rangeWithDots.push(i));

    if (safeCurrent + delta < safeTotal - 1) {
      rangeWithDots.push('...', safeTotal);
    } else if (safeTotal > 1) {
      rangeWithDots.push(safeTotal);
    }

    // Fallback for simple small ranges (avoiding dot logic complexity for small totals)
    if (safeTotal <= 7) {
      return Array.from({ length: safeTotal }, (_, i) => i + 1);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={cn("flex flex-col md:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-white/5", className)}>
      
      {/* Items Info */}
      <p className="text-zinc-500 text-sm order-2 md:order-1">
        Mostrando <span className="text-white font-medium">{startItem}-{endItem}</span> de <span className="text-white font-medium">{totalItems}</span> produtos
      </p>

      {/* Controls */}
      <div className="flex items-center gap-2 order-1 md:order-2">
        <button
          onClick={() => onPageChange(Math.max(1, safeCurrent - 1))}
          disabled={safeCurrent === 1}
          className="size-10 rounded-lg flex items-center justify-center border border-white/10 bg-black text-zinc-400 hover:text-white hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="size-5" />
        </button>
        
        {visiblePages.map((page, index) => {
             if (page === '...') {
               return (
                 <span key={`dots-${index}`} className="px-2 text-zinc-600">...</span>
               );
             }
             
             const pageNum = Number(page);
             const isActive = safeCurrent === pageNum;
             
             return (
               <button
                 key={pageNum}
                 onClick={() => onPageChange(pageNum)}
                 className={cn(
                   "size-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all",
                   isActive 
                     ? "bg-[#f9cb15] text-black shadow-[0_0_15px_rgba(249,203,21,0.25)] border border-[#f9cb15]" 
                     : "bg-black border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/5"
                 )}
               >
                 {pageNum}
               </button>
             );
        })}

        <button
          onClick={() => onPageChange(Math.min(safeTotal, safeCurrent + 1))}
          disabled={safeCurrent === safeTotal}
          className="size-10 rounded-lg flex items-center justify-center border border-white/10 bg-black text-zinc-400 hover:text-white hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
};
