'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

export interface GeoLocation {
  name: string;
  adminName1: string;   // province / state
  countryName: string;
  countryCode: string;
  lat: number;
  lng: number;
  timezone: string;     // e.g. "+07:00"
  timezoneId: string;   // e.g. "Asia/Ho_Chi_Minh"
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: GeoLocation) => void;
  placeholder?: string;
  className?: string;
}

export const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = 'Nhập thành phố (VD: Nha Trang)',
  className = '',
}: LocationAutocompleteProps) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data: GeoLocation[] = await res.json();
      if (Array.isArray(data)) {
        setResults(data);
        setIsOpen(data.length > 0);
        setHighlightIdx(-1);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    // Debounce API calls — 350ms
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(val), 350);
  };

  const handleSelect = (loc: GeoLocation) => {
    const label = formatLabel(loc);
    setQuery(label);
    setIsOpen(false);
    onChange(loc);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault();
      handleSelect(results[highlightIdx]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full px-4 py-3.5 bg-white border border-[#F0EBE5] rounded-xl text-sm focus:outline-none focus:border-[#8B5E3C] transition-all text-[#2D2D2D] shadow-sm pr-10 ${className}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A39A92]">
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <MapPin size={16} />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-[#F0EBE5] rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {results.map((loc, idx) => (
            <li
              key={`${loc.lat}-${loc.lng}-${idx}`}
              onClick={() => handleSelect(loc)}
              onMouseEnter={() => setHighlightIdx(idx)}
              className={`px-4 py-3 cursor-pointer text-sm transition-colors border-b border-[#F9F8F6] last:border-b-0 ${
                idx === highlightIdx
                  ? 'bg-[#FDF1E9] text-[#8B5E3C]'
                  : 'text-[#2D2D2D] hover:bg-[#F9F8F6]'
              }`}
            >
              <span className="font-medium">{loc.name}</span>
              {loc.adminName1 && (
                <span className="text-[#8B7E74]">, {loc.adminName1}</span>
              )}
              <span className="text-[#A39A92]">, {loc.countryName}</span>
              <span className="text-[10px] text-[#A39A92] ml-2">(GMT{loc.timezone})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

function formatLabel(loc: GeoLocation): string {
  const parts = [loc.name];
  if (loc.adminName1) parts.push(loc.adminName1);
  parts.push(loc.countryName);
  return parts.join(', ');
}
