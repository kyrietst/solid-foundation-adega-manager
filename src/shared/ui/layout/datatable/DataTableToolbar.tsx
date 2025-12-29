import React from 'react';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { FilterToggle } from '@/shared/ui/composite/filter-toggle';

interface DataTableToolbarProps {
    onSearchChange?: (value: string) => void;
    searchValue?: string;
    searchPlaceholder?: string;
    filters?: React.ReactNode;
    showFilters?: boolean;
    onToggleFilters?: () => void;
    glassEffect?: boolean;
    variant?: 'default' | 'premium' | 'subtle' | 'strong' | 'yellow';
    children?: React.ReactNode;
}

export const DataTableToolbar: React.FC<DataTableToolbarProps> = ({
    onSearchChange,
    searchValue,
    searchPlaceholder = 'Buscar...',
    filters,
    showFilters = false,
    onToggleFilters,
    glassEffect = true,
    variant = 'premium',
    children
}) => {
    if (!onSearchChange && !filters && !children) return null;

    return (
        <>
            {/* Search and Filters Bar */}
            <div className={cn(
                'flex flex-col sm:flex-row gap-4 p-4 rounded-lg items-center',
                glassEffect ? getGlassCardClasses(variant) : 'bg-gray-900/20 border border-gray-700/30'
            )}>
                {/* Search Input */}
                {onSearchChange && (
                    <div className="flex-1 w-full">
                        <SearchBar21st
                            value={searchValue || ''}
                            onChange={onSearchChange}
                            placeholder={searchPlaceholder}
                            debounceMs={150}
                            disableResizeAnimation={true}
                        />
                    </div>
                )}

                {/* Extra widgets (active filters, extra buttons) */}
                {children}

                {/* Filter Toggle */}
                {filters && (
                    <FilterToggle
                        isOpen={showFilters}
                        onToggle={onToggleFilters}
                        label="Filtros"
                    />
                )}
            </div>

            {/* Filters Panel */}
            {filters && showFilters && (
                <div className={cn(
                    'rounded-lg p-6 transition-all duration-300 shadow-lg mt-4',
                    glassEffect
                        ? cn(getGlassCardClasses(variant), 'border-primary-yellow/30 bg-gray-900/40')
                        : 'bg-gray-800/60 border border-gray-600/40'
                )}>
                    <div className="space-y-4">
                        {filters}
                    </div>
                </div>
            )}
        </>
    );
};
