
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useClickOutside } from "../../hooks/ui/use-click-outside";
import { SearchInput } from "./SearchInput";
import { SearchResults } from "./SearchResults";

interface SearchBar21stProps {
  onSearch?: (query: string) => void;
  onChange?: (value: string) => void;
  value?: string;
  debounceMs?: number;
  placeholder?: string;
  className?: string;
  initialQuery?: string;
  suggestions?: string[];
  disableResizeAnimation?: boolean;
}

export const SearchBar21st: React.FC<SearchBar21stProps> = ({
  onSearch,
  onChange,
  value,
  debounceMs = 0,
  placeholder = "Search...",
  className,
  initialQuery = "",
  suggestions = [],
  disableResizeAnimation = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value !== undefined ? value : initialQuery);

  // Sync with controlled value prop
  useEffect(() => {
    if (value !== undefined) {
      setSearchQuery(value);
    }
  }, [value]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect unspported browser for filters (Safari has issues with goo filters sometimes)
  const [isUnsupportedBrowser, setIsUnsupportedBrowser] = useState(false);
  useEffect(() => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsUnsupportedBrowser(isSafari);
  }, []);

  useClickOutside(containerRef, () => {
    setIsFocused(false);
  });

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Call controlled onChange if present
    if (onChange) {
      onChange(query);
    }

    if (query.trim()) {
      setFilteredSuggestions(
        suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
      );
    } else {
      setFilteredSuggestions([]);
    }
  }, [suggestions, onChange]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
    if (onChange) onChange(searchQuery);
    setIsFocused(false);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion);
    if (onSearch) onSearch(suggestion);
    if (onChange) onChange(suggestion);
    setIsFocused(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center ${className || ""}`}
      style={{ zIndex: 50 }}
    >
      <SearchInput
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        isFocused={isFocused}
        onFocus={() => setIsFocused(true)}
        onBlur={() => { }} // Click outside handles closing
        placeholder={placeholder}
        disableResizeAnimation={disableResizeAnimation}
        isUnsupportedBrowser={isUnsupportedBrowser}
      />

      <SearchResults
        suggestions={filteredSuggestions}
        isVisible={isFocused}
        onSelect={handleSuggestionSelect}
        isUnsupportedBrowser={isUnsupportedBrowser}
        searchQuery={searchQuery}
      />
    </div>
  );
};
