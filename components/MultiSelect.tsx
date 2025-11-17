'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Sélectionner...',
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span className={selected.length === 0 ? 'text-slate-500' : ''}>
          {selected.length === 0
            ? placeholder
            : selected.length === 1
              ? options.find((opt) => opt.value === selected[0])?.label || selected[0]
              : `${selected.length} sélectionné(s)`}
        </span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </Button>

      {isOpen && (
        <Card className="absolute z-50 mt-1 w-full border-slate-300 shadow-lg">
          <CardContent className="p-3">
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {options.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`multiselect-${option.value}`}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-2 rounded"
                >
                  <Checkbox
                    id={`multiselect-${option.value}`}
                    checked={selected.includes(option.value)}
                    onChange={() => toggleOption(option.value)}
                  />
                  <span className="flex-1 text-sm">{option.label}</span>
                </label>
              ))}
            </div>
            {selected.length > 0 && (
              <div className="mt-3 border-t border-slate-200 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={clearAll} className="w-full">
                  Effacer tout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map((value) => {
            const option = options.find((opt) => opt.value === value);
            return (
              <Badge
                key={value}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleOption(value)}
              >
                {option?.label || value} ×
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

