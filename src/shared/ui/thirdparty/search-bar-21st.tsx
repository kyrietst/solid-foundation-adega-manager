import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, CircleDot } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/core/config/utils";

// No internal mock suggestions – suggestions must be provided via props

const GooeyFilter = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
    <defs>
      <filter id="gooey-effect">
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" result="goo" />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
);

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void; // acionado em submit/click
  onChange?: (query: string) => void; // acionado a cada digitação (com debounce opcional)
  debounceMs?: number;
  value?: string; // opcional para controle externo
  className?: string;
  disableResizeAnimation?: boolean; // quando true, não anima width/scale
  suggestions?: string[]; // lista externa de sugestões
  showOnFocus?: boolean; // se true, mostra sugestões mesmo com query vazia
}

export const SearchBar21st = ({ placeholder = "Search...", onSearch, onChange, debounceMs = 0, value, className, disableResizeAnimation = false, suggestions: externalSuggestions, showOnFocus = false }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value ?? "");
  const [isAnimating, setIsAnimating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isClicked, setIsClicked] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Pointer follower (magnetic glow) – tuned for higher sensitivity and minimal lag
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const fastX = useSpring(pointerX, { stiffness: 1500, damping: 24, mass: 0.2 });
  const fastY = useSpring(pointerY, { stiffness: 1500, damping: 24, mass: 0.2 });

  const isUnsupportedBrowser = useMemo(() => {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent.toLowerCase();
    const isSafari = ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium");
    const isChromeOniOS = ua.includes("crios");
    return isSafari || isChromeOniOS;
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  // Debounce para onChange imediato (modo instantâneo)
  useEffect(() => {
    if (!onChange) return;
    if (debounceMs > 0) {
      const t = setTimeout(() => onChange(searchQuery), debounceMs);
      return () => clearTimeout(t);
    }
    onChange(searchQuery);
  }, [searchQuery, onChange, debounceMs]);

  // Sincronizar valor controlado
  useEffect(() => {
    if (value !== undefined) setSearchQuery(value);
  }, [value]);

  // Atualizar sugestões quando o texto ou lista externa mudar
  useEffect(() => {
    if (!externalSuggestions || externalSuggestions.length === 0) {
      setSuggestions([]);
      return;
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSuggestions(showOnFocus && isFocused ? externalSuggestions.slice(0, 10) : []);
      return;
    }
    const filtered = externalSuggestions
      .filter((item) => item.toLowerCase().includes(q))
      .slice(0, 10);
    setSuggestions(filtered);
  }, [searchQuery, externalSuggestions, isFocused, showOnFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFocused) {
      const rect = e.currentTarget.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      // Update MotionValues for ultra-responsive tracking (no React re-render required)
      pointerX.set(localX);
      pointerY.set(localY);
      // Keep plain state for clickParticles origin
      setMousePosition({ x: localX, y: localY });
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 3000);
  };

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const searchIconVariants = {
    initial: { scale: 1 },
    animate: {
      rotate: isAnimating ? [0, -15, 15, -10, 10, 0] : 0,
      scale: isAnimating ? [1, 1.3, 1] : 1,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  };

  const suggestionVariants = {
    hidden: (i: number) => ({
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, delay: i * 0.05 },
    }),
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 15, delay: i * 0.07 },
    }),
    exit: (i: number) => ({
      opacity: 0,
      y: -5,
      scale: 0.9,
      transition: { duration: 0.1, delay: i * 0.03 },
    }),
  };

  const particles = Array.from({ length: isFocused ? 18 : 0 }, (_, i) => (
    <motion.div
      key={i}
      initial={{ scale: 0 }}
      animate={{
        x: [0, (Math.random() - 0.5) * 40],
        y: [0, (Math.random() - 0.5) * 40],
        scale: [0, Math.random() * 0.8 + 0.4],
        opacity: [0, 0.8, 0],
      }}
      transition={{
        duration: Math.random() * 1.5 + 1.5,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
      className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        filter: "blur(2px)",
      }}
    />
  ));

  const clickParticles = isClicked
    ? Array.from({ length: 14 }, (_, i) => (
        <motion.div
          key={`click-${i}`}
          initial={{ x: mousePosition.x, y: mousePosition.y, scale: 0, opacity: 1 }}
          animate={{
            x: mousePosition.x + (Math.random() - 0.5) * 160,
            y: mousePosition.y + (Math.random() - 0.5) * 160,
            scale: Math.random() * 0.8 + 0.2,
            opacity: [1, 0],
          }}
          transition={{ 
            duration: 5.5, 
            ease: [0.25, 0.46, 0.45, 0.94],  // Fade out ultra suave
            delay: Math.random() * 0.5  // Variação aleatória no delay
          }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 200) + 55}, ${Math.floor(Math.random() * 255)}, 0.8)`,
            boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
          }}
        />
      ))
    : null;

  return (
    <div className={cn("relative w-full", className)}>
      <GooeyFilter />
      <motion.form
        onSubmit={handleSubmit}
        className="relative flex items-center justify-center w-full mx-auto"
        initial={disableResizeAnimation ? undefined : { width: "240px" }}
        animate={disableResizeAnimation ? undefined : { width: isFocused ? "340px" : "240px", scale: isFocused ? 1.05 : 1 }}
        transition={disableResizeAnimation ? undefined : { type: "spring", stiffness: 400, damping: 25 }}
        
      >
        <motion.div
          className={cn(
            "flex items-center w-full rounded-full border relative overflow-hidden backdrop-blur-md transition-all",
            isFocused ? "border-transparent shadow-xl" : "border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/50"
          )}
          style={{
            transitionDuration: isFocused ? '1200ms' : '2800ms',
            transitionTimingFunction: isFocused ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'cubic-bezier(0.07, 0.95, 0.15, 0.99)',
            transitionDelay: isFocused ? '0ms' : '200ms'
          }}
          animate={{
            boxShadow: isClicked
              ? "0 0 40px rgba(139, 92, 246, 0.5), 0 0 15px rgba(236, 72, 153, 0.7) inset"
              : isFocused
              ? "0 15px 35px rgba(0, 0, 0, 0.2)"
              : "0 0 0 rgba(0, 0, 0, 0)",
          }}
          transition={{
            duration: isClicked ? 3.5 : (isFocused ? 1.2 : 2.5),
            ease: isClicked ? [0.16, 1, 0.3, 1] : (isFocused ? "easeOut" : [0.23, 1, 0.32, 1]),
            delay: isClicked ? 0 : (isFocused ? 0 : 0.2)
          }}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
        >
          {isFocused && (
            <motion.div
              className="absolute inset-0 -z-10"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 0.15,
                background: "linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%)",
              }}
              transition={{ 
                duration: isFocused ? 2.2 : 6.0, // Aumentado: entrada 2.2s, saída 6s
                ease: isFocused ? [0.25, 0.46, 0.45, 0.94] : [0.07, 0.95, 0.15, 0.99], // Ambos muito suaves
                delay: isFocused ? 0.1 : 0.5 // Delay maior na saída
              }}
            />
          )}

          <div
            className="absolute inset-0 overflow-hidden rounded-full -z-5"
            style={{ filter: isUnsupportedBrowser ? "none" : "url(#gooey-effect)" }}
          >
            {/* Magnetic follower glow – follows the cursor with a fast spring */}
            {isFocused && (
              <motion.div
                className="pointer-events-none absolute h-28 w-28 rounded-full bg-purple-400/25 blur-3xl"
                style={{ left: fastX, top: fastY, x: "-50%", y: "-50%" }}
              />
            )}
            {particles}
          </div>

          {isClicked && (
            <>
              <motion.div
                className="absolute inset-0 -z-5 rounded-full bg-purple-400/10"
                initial={{ scale: 0, opacity: 0.7 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ 
                  duration: 4.8, 
                  ease: [0.12, 0, 0.39, 0],  // Saída muito gradual
                  delay: 0.2
                }}
              />
              <motion.div
                className="absolute inset-0 -z-5 rounded-full bg-white dark:bg-white/20"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0 }}
                transition={{ 
                  duration: 5.2, 
                  ease: [0.19, 1, 0.22, 1],  // Transição muito suave
                  delay: 0.1
                }}
              />
            </>
          )}

          {clickParticles}

          <motion.div className="pl-4 py-3" variants={searchIconVariants} initial="initial" animate="animate">
            <Search
              size={20}
              strokeWidth={isFocused ? 2.5 : 2}
              className={cn(
                "transition-all",
                isAnimating ? "text-purple-500" : isFocused ? "text-purple-600" : "text-gray-500 dark:text-gray-300",
              )}
              style={{
                transitionDuration: isFocused ? '800ms' : '2200ms',
                transitionTimingFunction: isFocused ? 'ease-out' : 'cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            />
          </motion.div>

          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 400)}
            className={cn(
              "w-full py-3 bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium text-base relative z-10 transition-all",
              isFocused ? "text-gray-800 dark:text-white tracking-wide" : "text-gray-600 dark:text-gray-300"
            )}
            style={{
              transitionDuration: isFocused ? '600ms' : '1800ms',
              transitionTimingFunction: isFocused ? 'ease-out' : 'cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          />

          <AnimatePresence>
            {searchQuery && (
              <motion.button
                type="submit"
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                whileHover={{
                  scale: 1.05,
                  background: "linear-gradient(45deg, #8B5CF6 0%, #EC4899 100%)",
                  boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 mr-2 text-sm font-medium rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white backdrop-blur-sm shadow-lg"
                style={{
                  transition: 'all 1200ms cubic-bezier(0.23, 1, 0.32, 1)'
                }}
              >
                Search
              </motion.button>
            )}
          </AnimatePresence>

          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.05, 0.12, 0.08, 0.02, 0], // Sequência mais suave e longa
                background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.8) 0%, transparent 70%)",
              }}
              transition={{ 
                duration: 5.5, // Era 3s, agora 5.5s
                repeat: 0, 
                ease: [0.23, 1, 0.32, 1], // Cubic bezier muito suave
                delay: 0.3 // Pequeno delay para sincronizar
              }}
            />
          )}
        </motion.div>
      </motion.form>

      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: [0.16, 1, 0.3, 1] // Cubic bezier muito suave
            }}
            className="absolute z-[300] w-full mt-2 overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg shadow-xl border border-gray-100 dark:border-gray-700"
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              filter: isUnsupportedBrowser ? "none" : "drop-shadow(0 15px 15px rgba(0,0,0,0.1))",
            }}
          >
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion}
                  custom={index}
                  variants={suggestionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    if (onSearch) onSearch(suggestion);
                    setIsFocused(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 group transition-all duration-700"
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                  }}
                >
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: index * 0.06 }}>
                    <CircleDot size={16} className="text-purple-400 group-hover:text-purple-600 transition-all duration-500" 
                      style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
                  </motion.div>
                  <motion.span
                    className="text-gray-700 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-all duration-600"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                    initial={{ x: -5, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    {suggestion}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar21st;


