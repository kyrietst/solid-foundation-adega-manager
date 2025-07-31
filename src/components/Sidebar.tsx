"use client";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconChartBar,
  IconShoppingCart,
  IconPackage,
  IconRefresh,
  IconUsers,
  IconTruck,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  // Definir links baseado na documentação
  const allLinks = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <IconChartBar className="h-5 w-5 shrink-0 text-adega-gold" />
      ),
      roles: ["admin", "employee"],
    },
    {
      id: "sales",
      label: "Vendas",
      href: "/sales",
      icon: (
        <IconShoppingCart className="h-5 w-5 shrink-0 text-adega-gold" />
      ),
      roles: ["admin", "employee"],
    },
    {
      id: "inventory",
      label: "Estoque",
      href: "/inventory",
      icon: (
        <IconPackage className="h-5 w-5 shrink-0 text-adega-gold" />
      ),
      roles: ["admin", "employee"],
    },
    {
      id: "customers",
      label: "Clientes",
      href: "/customers",
      icon: (
        <IconUsers className="h-5 w-5 shrink-0 text-adega-gold" />
      ),
      roles: ["admin", "employee"],
    },
    {
      id: "delivery",
      label: "Delivery",
      href: "/delivery",
      icon: (
        <IconTruck className="h-5 w-5 shrink-0 text-adega-gold" />
      ),
      roles: ["admin", "employee", "delivery"],
    },
    {
      id: "movements",
      label: "Movimentações",
      href: "/movements",
      icon: (
        <IconRefresh className="h-5 w-5 shrink-0 text-adega-gold" />
      ),
      roles: ["admin"],
    },
    {
      id: "users",
      label: "Usuários",
      href: "/users",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-adega-gold" />
      ),
      roles: ["admin"],
    },
  ];

  // Filtrar links baseado no sistema de permissões da documentação
  const getFilteredLinks = () => {
    if (!userRole) return [];

    // Admin principal (adm@adega.com) tem acesso a tudo
    if (user?.email === 'adm@adega.com') {
      return allLinks;
    }

    // Entregadores só veem delivery
    if (userRole === 'delivery') {
      return allLinks.filter(item => item.id === 'delivery');
    }

    // Outros usuários conforme roles permitidos
    return allLinks.filter(item => item.roles.includes(userRole));
  };

  const filteredLinks = getFilteredLinks();

  // Converter para formato esperado pelo SidebarLink
  const links = filteredLinks.map(link => ({
    label: link.label,
    href: link.href,
    icon: link.icon,
  }));

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut();
    navigate('/auth');
  };

  return (
    <div className="h-screen">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-8">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <div className="mb-8">
              {open ? <Logo /> : <LogoIcon />}
            </div>
            <nav className="flex flex-col gap-1">
              {links.map((link, idx) => (
                <SidebarLink 
                  key={idx} 
                  link={link} 
                  onClick={(e) => handleLinkClick(link.href, e)}
                  className={cn(
                    location.pathname === link.href
                      ? "bg-adega-charcoal/80 text-adega-yellow shadow-lg border border-white/10-gold/30"
                      : "hover:bg-adega-graphite/40"
                  )}
                />
              ))}
            </nav>
          </div>
          <div className="border-t border-white/10-charcoal/50 pt-4 space-y-2">
            {/* User Info */}
            <SidebarLink
              link={{
                label: user?.email || "Usuário",
                href: "#",
                icon: (
                  <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-r from-adega-gold to-adega-amber flex items-center justify-center text-black text-sm font-bold shadow-lg">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                ),
              }}
              className="hover:bg-adega-graphite/40"
            />
            {/* Logout */}
            <SidebarLink
              link={{
                label: "Sair",
                href: "#",
                icon: (
                  <IconLogout className="h-5 w-5 shrink-0 text-red-400" />
                ),
              }}
              onClick={handleLogout}
              className="hover:bg-red-900/30 hover:text-red-300"
            />
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}

export const Logo = () => {
  return (
    <div className="relative z-20 flex items-center space-x-3 py-2">
      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-r from-adega-gold to-adega-amber shadow-lg" />
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col"
      >
        <span className="font-bold text-white text-lg leading-tight">
          Adega
        </span>
        <span className="text-adega-gold text-xs font-medium">
          Manager
        </span>
      </motion.div>
    </div>
  );
};

export const LogoIcon = () => {
  return (
    <div className="relative z-20 flex items-center justify-center py-2">
      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-r from-adega-gold to-adega-amber shadow-lg" />
    </div>
  );
};