'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import CategoryIcon, { getCleanCategoryName } from './CategoryIcon';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  className?: string;
  borderClass?: string;
}

export default function CategorySelect({
  value,
  onChange,
  options,
  className = '',
  borderClass = 'border-slate-800 focus:border-indigo-500'
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-slate-950 dark:bg-slate-900 border rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none cursor-pointer hover:border-slate-700 transition-all text-left ${borderClass}`}
      >
        <div className="flex items-center gap-2">
          <CategoryIcon category={value} className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>{value === 'ALL' ? 'Tất cả danh mục' : getCleanCategoryName(value)}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Options List */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto custom-scrollbar bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1 divide-y divide-slate-850/30 animate-in fade-in slide-in-from-top-1 duration-100">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                option === value
                  ? 'bg-indigo-500/10 text-indigo-400 font-semibold'
                  : 'text-slate-350 hover:bg-slate-800/80 hover:text-slate-100'
              }`}
            >
              <CategoryIcon category={option} className={`w-3.5 h-3.5 shrink-0 ${option === value ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{option === 'ALL' ? 'Tất cả danh mục' : getCleanCategoryName(option)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
