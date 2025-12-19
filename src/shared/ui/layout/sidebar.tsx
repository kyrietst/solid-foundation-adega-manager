"use client";

import { cn } from "@/core/config/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Lock, ChevronRight, ChevronLeft } from "lucide-react";
import { getSFProTextClasses } from "@/core/config/theme-utils";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

// eslint-disable-next-line react-refresh/only-export-components
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as any)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        // Glassy sidebar matching cards style with hero spotlight effect
        "h-full px-3 py-4 hidden md:flex md:flex-col bg-black/70 backdrop-blur-xl border-r border-white/20 shadow-lg w-[300px] flex-shrink-0 z-20 hero-spotlight relative",
        className
      )}
      animate={{
        width: animate ? (open ? "300px" : "60px") : "300px",
      }}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
        (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
      }}
      {...props}
    >

      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          // Mobile top bar matching cards style
          "h-12 px-4 py-3 flex flex-row md:hidden items-center justify-between bg-black/70 backdrop-blur-xl border-b border-white/20 shadow-lg w-full"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <button
            onClick={() => setOpen(!open)}
            aria-label="Abrir menu de navegação"
            aria-expanded={open}
            className="p-2 text-adega-gold hover:bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-adega-gold transition-colors"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl p-10 z-nav flex flex-col justify-between hero-spotlight",
                className
              )}
              onMouseMove={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
                (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
              }}
            >
              <button
                onClick={() => setOpen(!open)}
                aria-label="Fechar menu de navegação"
                className="absolute right-10 top-10 z-50 p-2 text-adega-gold hover:bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-adega-gold transition-colors"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  onClick,
  disabled = false,
  ...props
}: {
  link: Links;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}) => {
  const { open, animate } = useSidebar();

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e as unknown as React.MouseEvent);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-lg transition-all duration-200",
        disabled
          ? "cursor-not-allowed pointer-events-none opacity-60"
          : "cursor-pointer hover:transform hover:-translate-y-0.5",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={link.label}
      aria-disabled={disabled}
      {...props}
    >
      {/* Ícone do link com estilo condicional */}
      <div className={cn(
        "transition-all duration-200",
        disabled && "opacity-50"
      )}>
        {React.cloneElement(link.icon as React.ReactElement, {
          className: cn(
            ((link.icon as React.ReactElement).props as any).className,
            disabled && "text-gray-500"
          )
        } as any)}
      </div>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className={cn(
          getSFProTextClasses('label', 'neutral'),
          disabled
            ? "text-gray-500"
            : "text-gray-100 group-hover/sidebar:translate-x-1",
          "transition duration-150 whitespace-pre inline-block !p-0 !m-0"
        )}
      >
        {link.label}
      </motion.span>

      {/* Ícone de cadeado para links desabilitados (apenas quando sidebar está aberta) */}
      {disabled && (
        <motion.div
          animate={{
            display: animate ? (open ? "inline-block" : "none") : "inline-block",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className="ml-auto"
        >
          <Lock className="h-4 w-4 text-gray-500" aria-hidden="true" />
        </motion.div>
      )}
    </div>
  );
};
