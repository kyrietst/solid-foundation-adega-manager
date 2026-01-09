import React, { useRef, useEffect } from 'react';
import { useCategories } from '@/features/inventory/hooks/useCategories';
import { cn } from '@/core/config/utils';
import { motion } from 'framer-motion';

interface CategoryTabsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  className?: string;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  onSelectCategory,
  className
}) => {
  const { categories, loading } = useCategories();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Wheel horizontal scroll support (Fix for desktop)
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY === 0) return;
        // Important: passive: false is required to preventDefault()
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      };
      
      el.addEventListener('wheel', onWheel, { passive: false }); // <--- FIX HERE
      return () => el.removeEventListener('wheel', onWheel);
    }
  }, [loading]); // Re-bind when loading finishes and element appears

  if (loading && categories.length === 0) {
    return (
      <div className="h-12 w-full animate-pulse bg-white/5 rounded-xl mx-4 my-2" />
    );
  }

  const allCategories = ['all', ...categories];

  return (
    <div className={cn("w-full relative z-10", className)}>
      <div
        ref={scrollContainerRef}
        className="flex flex-nowrap gap-2 items-center overflow-x-auto scrollbar-hide px-0 py-1 pr-10"
        style={{
          // Ensure it handles horizontal scroll smoothly
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {/* Adicionado 'min-w-0' para garantir que os itens encolham se necessário, mas 'shrink-0' nos botões impede isso */}
        {allCategories.map((cat, index) => {
          const isSelected = selectedCategory === cat || (cat === 'all' && (selectedCategory === '' || selectedCategory === 'all'));
          const label = cat === 'all' ? 'Todos' : cat;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat === 'all' ? '' : cat)}
              className={cn(
                "shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-sm transition-all duration-300 transform active:scale-95",
                isSelected
                  ? "bg-[#FACC15] text-[#09090b] font-bold shadow-md hover:bg-[#FACC15]/90"
                  : "bg-transparent text-zinc-400 hover:text-white font-medium hover:bg-white/5"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Fade indicators if needed, but styling usually handles it */}
    </div>
  );
};
