'use client';

/**
 * Combobox Component
 * 
 * Allows selecting from a list of options or adding a custom value.
 * Supports autocomplete and keyboard navigation.
 */

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
  customLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Sélectionnez ou tapez...',
  allowCustom = true,
  customLabel = 'Ajouter',
  className,
  disabled = false,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if current value is a custom value (not in options)
  const isCustomValue = value && !options.find(opt => opt.value === value);
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustomInput(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
    setShowCustomInput(false);
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      // Normalize: lowercase, trim, replace spaces with underscores
      const normalized = customValue.trim().toLowerCase().replace(/\s+/g, '_');
      onChange(normalized);
      setIsOpen(false);
      setCustomValue('');
      setShowCustomInput(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && showCustomInput && customValue.trim()) {
      e.preventDefault();
      handleCustomSubmit();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setShowCustomInput(false);
      setSearchQuery('');
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={cn('truncate', !value && 'text-slate-500')}>
          {isCustomValue
            ? value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            : selectedOption?.label || placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {isOpen && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg border-slate-200">
          <CardContent className="p-2">
            {/* Search Input */}
            <div className="px-2 py-1.5 border-b border-slate-200">
              <Input
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowCustomInput(false);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher..."
                className="h-8"
                autoFocus
              />
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-auto mt-1">
              {filteredOptions.length > 0 ? (
                <div className="space-y-0.5">
                  {filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-100 flex items-center justify-between',
                        value === option.value && 'bg-indigo-50 text-indigo-900'
                      )}
                    >
                      <span>{option.label}</span>
                      {value === option.value && (
                        <Check className="h-4 w-4 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 text-sm text-slate-500 text-center">
                  Aucun résultat
                </div>
              )}

              {/* Custom Value Input */}
              {allowCustom && (
                <>
                  {!showCustomInput ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomInput(true);
                        setSearchQuery('');
                        setTimeout(() => inputRef.current?.focus(), 0);
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-100 flex items-center gap-2 mt-1 border-t border-slate-200 pt-2"
                    >
                      <Plus className="h-4 w-4 text-indigo-600" />
                      <span className="text-indigo-600 font-medium">{customLabel}</span>
                    </button>
                  ) : (
                    <div className="mt-2 pt-2 border-t border-slate-200 space-y-2">
                      <Input
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tapez votre valeur..."
                        className="h-8"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCustomSubmit}
                          disabled={!customValue.trim()}
                          className="flex-1 h-8 text-xs"
                        >
                          Ajouter
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowCustomInput(false);
                            setCustomValue('');
                          }}
                          className="h-8 text-xs"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

