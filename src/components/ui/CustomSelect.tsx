import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (val: string) => void;
    options: SelectOption[];
    placeholder: string;
    className?: string;
    required?: boolean;
}

export default function CustomSelect({ value, onChange, options, placeholder, className = "", required = false }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Native validation trigger */}
            {required && <input type="text" className="absolute opacity-0 w-0 h-0 pointer-events-none" required value={value} onChange={() => {}} tabIndex={-1} />}
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between text-left p-3 rounded-xl border transition-all outline-none
                    ${isOpen ? 'border-[var(--color-brand-orange)]/50 bg-white ring-2 ring-[var(--color-brand-orange)]/10 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-white'}
                    ${!value ? 'text-gray-400' : 'text-gray-900'} text-sm`}
            >
                <span className="block truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl shadow-black/5 py-1 overflow-hidden"
                    >
                        <div className="max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                                        ${value === option.value ? 'bg-[var(--color-brand-orange)]/5 text-[var(--color-brand-orange)] font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    {option.label}
                                    {value === option.value && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
