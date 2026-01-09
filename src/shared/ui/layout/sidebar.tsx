
"use client";

import { cn } from "@/core/config/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Lock } from "lucide-react";

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

export const SidebarBody = (props: Omit<React.ComponentProps<typeof motion.div>, "children"> & { children: React.ReactNode }) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof motion.div>, "children"> & { children: React.ReactNode }) => {
  const { open, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        // Glassy sidebar matching cards style with hero spotlight effect
        "h-full py-4 hidden md:flex md:flex-col !bg-[#09090b] border-r border-white/5 shadow-2xl w-[300px] flex-shrink-0 z-20 relative overflow-hidden",
        open ? "px-3" : "px-2",
        className
      )}
      animate={{
        width: animate ? (open ? "300px" : "60px") : "300px",
      }}
      style={{
        '--x': '50%',
        '--y': '50%',
        backgroundImage: 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(250, 204, 21, 0.12) 0%, transparent 40%)',
        backgroundColor: '#09090b',
      } as React.CSSProperties}
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
}: Omit<React.ComponentProps<typeof motion.div>, "children"> & { children: React.ReactNode }) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          // Mobile top bar matching cards style
          "h-12 px-4 py-3 flex flex-row md:hidden items-center justify-between bg-surface/80 backdrop-blur-xl border-b border-white/10 shadow-lg w-full"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <button
            onClick={() => setOpen(!open)}
            aria-label="Abrir menu de navegação"
            aria-expanded={open}
            className="p-2 text-brand hover:bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-brand transition-colors"
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
                "fixed h-full w-full inset-0 bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl p-10 z-nav flex flex-col justify-between hero-spotlight",
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
                className="absolute right-10 top-10 z-50 p-2 text-brand hover:bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-brand transition-colors"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
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
  onClick?: (e: React.SyntheticEvent) => void;
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
      onClick?.(e);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 group/sidebar transition-all duration-200",
        open 
          ? "w-full justify-start py-2 px-2 rounded-lg" 
          : "w-10 h-10 justify-center rounded-xl mx-auto p-0",
        disabled
          ? "cursor-not-allowed pointer-events-none opacity-60"
          : "cursor-pointer hover:bg-[#f9cb15]/5",
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
        "transition-all duration-200 text-muted-foreground group-hover/sidebar:text-foreground",
        disabled && "text-muted-foreground/50",
        "h-5 w-5 flex items-center justify-center"
      )}>
        {React.isValidElement<React.HTMLAttributes<HTMLElement>>(link.icon) && React.cloneElement(link.icon, {
          className: cn(
            link.icon.props.className,
            disabled && "text-muted-foreground/50"
          )
        })}
      </div>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className={cn(
          "text-sm font-medium",
          disabled
            ? "text-muted-foreground/50"
            : "text-muted-foreground group-hover/sidebar:text-brand",
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
          <Lock className="h-3 w-3 text-muted-foreground/40" aria-hidden="true" />
        </motion.div>
      )}
    </div>
  );
};
