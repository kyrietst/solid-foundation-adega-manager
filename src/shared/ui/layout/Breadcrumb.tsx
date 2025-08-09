/**
 * Breadcrumb - Sistema de navegação hierárquica
 * Enhanced for Story 2.3: Glass morphism + Black/Gold theme + React Router integration
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { generateBreadcrumbFromPath } from '@/core/config/routes-config';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  active?: boolean;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
  className?: string;
  separator?: React.ReactNode;
  showHome?: boolean;
  homeLabel?: string;
  homePath?: string;
  maxItems?: number;
  responsive?: boolean;
}

// Removido: mapeamento movido para routes-config.ts

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  variant = 'premium',
  glassEffect = true,
  className,
  separator = <ChevronRight className="w-4 h-4 text-gray-500" />,
  showHome = true,
  homeLabel = 'Início',
  homePath = '/',
  maxItems = 4,
  responsive = true
}) => {
  const location = useLocation();
  
  // Gera breadcrumb automaticamente baseado na URL atual se items não fornecidos
  const generateBreadcrumbFromLocation = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Adiciona home se solicitado
    if (showHome) {
      breadcrumbs.push({
        label: homeLabel,
        path: homePath,
        icon: <Home className="w-4 h-4" />
      });
    }
    
    // Usa a configuração de rotas para gerar breadcrumbs
    const configBreadcrumbs = generateBreadcrumbFromPath(location.pathname);
    
    configBreadcrumbs.forEach((item, index) => {
      const isLast = index === configBreadcrumbs.length - 1;
      breadcrumbs.push({
        label: item.label,
        path: item.path,
        icon: item.icon ? <item.icon className="w-4 h-4" /> : undefined,
        active: isLast
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbFromLocation();
  
  // Trunca items se exceder maxItems
  const displayItems = breadcrumbItems.length > maxItems
    ? [
        ...breadcrumbItems.slice(0, 1), // Primeiro item (Home)
        { label: '...', path: '', icon: null }, // Ellipsis
        ...breadcrumbItems.slice(-2) // Últimos 2 items
      ]
    : breadcrumbItems;

  // Glass morphism classes
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';
  const containerClasses = cn(
    'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200',
    glassEffect 
      ? cn(glassClasses, 'bg-gray-900/40 border border-gray-700/50 backdrop-blur-sm shadow-lg')
      : 'bg-gray-100 border border-gray-300',
    responsive && 'text-sm md:text-base',
    className
  );

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  return (
    <nav aria-label="Breadcrumb" className={containerClasses}>
      <ol className="flex items-center space-x-2 flex-wrap">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.label === '...';
          
          return (
            <motion.li
              key={`${item.path}-${index}`}
              className="flex items-center space-x-2"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              custom={index}
            >
              {/* Breadcrumb Item */}
              {isEllipsis ? (
                <span className={cn(
                  "px-2 py-1 text-gray-500 select-none",
                  glassEffect ? "text-gray-400" : "text-gray-600"
                )}>
                  {item.label}
                </span>
              ) : isLast || item.active ? (
                // Active/Current page - não clicável
                <span
                  className={cn(
                    "flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium",
                    glassEffect 
                      ? "text-primary-yellow bg-primary-yellow/20 border border-primary-yellow/30"
                      : "text-blue-600 bg-blue-50 border border-blue-200",
                    "cursor-default select-none"
                  )}
                  aria-current="page"
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span className="truncate max-w-[150px] md:max-w-none">
                    {item.label}
                  </span>
                </span>
              ) : (
                // Link - clicável
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all duration-200 hover:scale-105",
                    glassEffect
                      ? "text-gray-300 hover:text-white hover:bg-gray-800/60 border border-transparent hover:border-gray-600/50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 focus:ring-offset-2 focus:ring-offset-transparent"
                  )}
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span className="truncate max-w-[150px] md:max-w-none">
                    {item.label}
                  </span>
                </Link>
              )}

              {/* Separator */}
              {!isLast && (
                <span 
                  className="flex-shrink-0"
                  aria-hidden="true"
                >
                  {separator}
                </span>
              )}
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
};

// Hook personalizado para usar breadcrumb com configuração automática
export const useBreadcrumb = (customItems?: BreadcrumbItem[]) => {
  const location = useLocation();
  
  const getCurrentPageInfo = () => {
    const configBreadcrumbs = generateBreadcrumbFromPath(location.pathname);
    const currentItem = configBreadcrumbs[configBreadcrumbs.length - 1];
    
    return {
      currentRoute: location.pathname.split('/').filter(Boolean).pop() || 'dashboard',
      currentLabel: currentItem?.label || 'Página',
      currentIcon: currentItem?.icon,
      breadcrumbs: configBreadcrumbs
    };
  };
  
  return {
    currentPageInfo: getCurrentPageInfo(),
    breadcrumbItems: customItems,
    location
  };
};