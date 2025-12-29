
import React, { useRef, useState, useMemo } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/core/config/utils";

interface SearchInputProps {
    searchQuery: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    isFocused: boolean;
    onFocus: () => void;
    onBlur: () => void;
    placeholder?: string;
    disableResizeAnimation?: boolean;
    isUnsupportedBrowser: boolean;
    className?: string; // For container class
}

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

export const SearchInput: React.FC<SearchInputProps> = ({
    searchQuery,
    onSearchChange,
    onSearchSubmit,
    isFocused,
    onFocus,
    onBlur,
    placeholder,
    disableResizeAnimation,
    isUnsupportedBrowser,
    className
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Pointer follower (magnetic glow)
    const pointerX = useMotionValue(0);
    const pointerY = useMotionValue(0);
    const fastX = useSpring(pointerX, { stiffness: 1500, damping: 24, mass: 0.2 });
    const fastY = useSpring(pointerY, { stiffness: 1500, damping: 24, mass: 0.2 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isFocused) {
            const rect = e.currentTarget.getBoundingClientRect();
            const localX = e.clientX - rect.left;
            const localY = e.clientY - rect.top;
            pointerX.set(localX);
            pointerY.set(localY);
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

    // Sync focus to ref
    React.useEffect(() => {
        if (isFocused && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isFocused]);

    const handleSubmitInternal = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 1000);
        }
        onSearchSubmit(e);
    }

    const searchIconVariants = {
        initial: { scale: 1 },
        animate: {
            rotate: isAnimating ? [0, -15, 15, -10, 10, 0] : 0,
            scale: isAnimating ? [1, 1.3, 1] : 1,
            transition: { duration: 0.6, ease: "easeInOut" as const },
        },
    };

    const particles = useMemo(() => Array.from({ length: isFocused ? 18 : 0 }, (_, i) => (
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
    )), [isFocused]);

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
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: Math.random() * 0.5
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
                onSubmit={handleSubmitInternal}
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
                                duration: isFocused ? 2.2 : 6.0,
                                ease: isFocused ? [0.25, 0.46, 0.45, 0.94] : [0.07, 0.95, 0.15, 0.99],
                                delay: isFocused ? 0.1 : 0.5
                            }}
                        />
                    )}

                    <div
                        className="absolute inset-0 overflow-hidden rounded-full -z-5"
                        style={{ filter: isUnsupportedBrowser ? "none" : "url(#gooey-effect)" }}
                    >
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
                                    ease: [0.12, 0, 0.39, 0],
                                    delay: 0.2
                                }}
                            />
                            <motion.div
                                className="absolute inset-0 -z-5 rounded-full bg-white dark:bg-white/20"
                                initial={{ opacity: 0.5 }}
                                animate={{ opacity: 0 }}
                                transition={{
                                    duration: 5.2,
                                    ease: [0.19, 1, 0.22, 1],
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
                        onChange={onSearchChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSubmitInternal(e);
                            }
                        }}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        className={cn(
                            "w-full py-3 bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-400 font-medium text-base relative z-10 transition-all",
                            "!text-white tracking-wide"
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
                                opacity: [0, 0.05, 0.12, 0.08, 0.02, 0],
                                background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.8) 0%, transparent 70%)",
                            }}
                            transition={{
                                duration: 5.5,
                                repeat: 0,
                                ease: [0.23, 1, 0.32, 1],
                                delay: 0.3
                            }}
                        />
                    )}
                </motion.div>
            </motion.form>
        </div>
    );
};
