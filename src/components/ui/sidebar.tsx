"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";

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
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
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
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
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
    <>
      <motion.div
        className={cn(
          "h-full px-3 py-4 hidden lg:flex lg:flex-col bg-black/20 backdrop-blur-xl border-r border-white/10 w-[280px] shrink-0 relative z-20 shadow-2xl",
          className
        )}
        animate={{
          width: animate ? (open ? "280px" : "70px") : "280px",
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
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
          "h-16 px-4 py-3 flex flex-row lg:hidden items-center justify-between bg-black/30 backdrop-blur-xl border-b border-white/10 w-full shadow-lg"
        )}
        {...props}
      >
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600" />
          <span className="font-bold text-white text-lg">Adega</span>
        </div>
        <div className="flex justify-end z-20">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <IconMenu2 className="text-white h-6 w-6" />
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
                "fixed h-full w-full inset-0 bg-black/40 backdrop-blur-xl z-[5] flex flex-col",
                className
              )}
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-800/50">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600" />
                  <span className="font-bold text-white text-xl">Adega Manager</span>
                </div>
                <button
                  className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                  onClick={() => setOpen(!open)}
                >
                  <IconX className="text-white h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {children}
              </div>
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
  ...props
}: {
  link: Links;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}) => {
  const { open, animate } = useSidebar();
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-3 px-3 cursor-pointer hover:bg-zinc-800/60 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
        className
      )}
      {...props}
    >
      <div className="shrink-0 group-hover/sidebar:scale-110 transition-transform duration-200">
        {link.icon}
      </div>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
        className="text-gray-100 text-sm font-medium group-hover/sidebar:text-white transition-colors duration-200 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </div>
  );
};
