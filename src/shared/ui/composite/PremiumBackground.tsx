import React from 'react';
import { cn } from '@/core/config/utils';

interface PremiumBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const PremiumBackground: React.FC<PremiumBackgroundProps> = ({ children, className }) => {
  return (
    <div className={cn("fixed inset-0 w-full h-full bg-[#050505]", className)}>
      {/* 1. Base Dark Layer (Safety) */}
      <div className="fixed inset-0 z-0 bg-[#050505]" />
      
      {/* 2. Texture Image Layer */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCLTe2IveaHi2euIRM1n2sfRx5OZRDbzoqalzDUdmrL6N7j3bvEn-AMB1WfjAGszfQDjic-bBmOR-cmML3fkwaoLlVUciv1hNLb7PvcI6xwmcnaJM8k2osWBNgXoHCWSlEPgVVd6OsAtc0iM_xvQTedL1M0A2KPlQl_wEW0uaH4CMpkJlCGKjQW9-SJzUsVgK_dUVepeCLfOvRlmtrE2Mn_O6ngqD6tI2N8ykds9NNWKLiGQBI62GJ5k7QkJoWFAMqmY2few_BTGA')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(40%) contrast(120%)'
        }}
      />
      
      {/* 3. Gradient Vignette Overlay (The "Darkening" Effect) */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(5,5,5,0.4)_0%,rgba(5,5,5,0.95)_100%)]" />

      {/* 4. Content Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
