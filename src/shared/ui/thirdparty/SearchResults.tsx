
import React from "react";
import { CircleDot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResultsProps {
    suggestions: string[];
    isVisible: boolean;
    onSelect: (suggestion: string) => void;
    isUnsupportedBrowser: boolean;
    searchQuery: string; // for key if needed, or just to know if it exists
}

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
        transition: { type: "spring" as const, stiffness: 300, damping: 15, delay: i * 0.07 },
    }),
    exit: (i: number) => ({
        opacity: 0,
        y: -5,
        scale: 0.9,
        transition: { duration: 0.1, delay: i * 0.03 },
    }),
};

export const SearchResults: React.FC<SearchResultsProps> = ({
    suggestions,
    isVisible,
    onSelect,
    isUnsupportedBrowser,
}) => {
    return (
        <AnimatePresence>
            {isVisible && suggestions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: 10, height: 0 }}
                    transition={{
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1] // Cubic bezier muito suave
                    }}
                    className="absolute z-dropdown w-full mt-2 overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg shadow-xl border border-gray-100 dark:border-gray-700"
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
                                onClick={() => onSelect(suggestion)}
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
    );
};
