/**
 * Voice Fields Confirmation Component
 * 
 * Shows extracted fields from voice and allows user to:
 * 1. Confirm/edit extracted data
 * 2. Fill in missing essential fields
 * 3. Submit with complete data
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, Edit2, X, Lightbulb } from 'lucide-react';

interface ExtractedData {
  title: string;
  problem_statement: string;
  proposed_solution?: string | null;
  current_manual_process?: string | null;
  digitization_opportunity?: string | null;
  category?: string;
  location?: string;
}

interface VoiceFieldsConfirmationProps {
  extractedData: ExtractedData;
  onSubmit: (data: ExtractedData) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { value: 'health', label: 'Santé' },
  { value: 'education', label: 'Éducation' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'tech', label: 'Technologie' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'administration', label: 'Administration' },
  { value: 'logistics', label: 'Logistique' },
  { value: 'finance', label: 'Finance' },
  { value: 'customer_service', label: 'Service Client' },
  { value: 'inclusion', label: 'Inclusion' },
  { value: 'other', label: 'Autre' },
];

const LOCATIONS = [
  { value: 'casablanca', label: 'Casablanca' },
  { value: 'rabat', label: 'Rabat' },
  { value: 'marrakech', label: 'Marrakech' },
  { value: 'kenitra', label: 'Kenitra' },
  { value: 'tangier', label: 'Tanger' },
  { value: 'agadir', label: 'Agadir' },
  { value: 'fes', label: 'Fès' },
  { value: 'meknes', label: 'Meknès' },
  { value: 'oujda', label: 'Oujda' },
  { value: 'other', label: 'Autre' },
];

export default function VoiceFieldsConfirmation({
  extractedData,
  onSubmit,
  onCancel,
}: VoiceFieldsConfirmationProps) {
  const [data, setData] = useState<ExtractedData>(extractedData);
  const [editingField, setEditingField] = useState<string | null>(null);

  const handleSubmit = () => {
    // Validate required fields
    if (!data.title || !data.problem_statement) {
      alert('⚠️ Le titre et la description du problème sont requis');
      return;
    }

    onSubmit(data);
  };

  const updateField = (field: keyof ExtractedData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    setEditingField(null);
  };

  const FieldDisplay = ({ 
    label, 
    field, 
    value, 
    required = false,
    multiline = false,
    guidance = null
  }: { 
    label: string; 
    field: keyof ExtractedData; 
    value: string | null | undefined;
    required?: boolean;
    multiline?: boolean;
    guidance?: string | null;
  }) => {
    const isEditing = editingField === field;
    const displayValue = value || (required ? '' : '(Non spécifié)');
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    // Auto-focus when entering edit mode
    useEffect(() => {
      if (isEditing && inputRef.current) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          inputRef.current?.focus();
          // For textarea, move cursor to end
          if (inputRef.current instanceof HTMLTextAreaElement) {
            inputRef.current.setSelectionRange(
              inputRef.current.value.length,
              inputRef.current.value.length
            );
          }
        }, 10);
      }
    }, [isEditing]);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {!isEditing && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditingField(field);
              }}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              Modifier
            </button>
          )}
        </div>
        
        {guidance && !isEditing && (
          <div className="text-xs text-slate-500 bg-blue-50 p-2 rounded flex items-start gap-2">
            <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{guidance}</span>
          </div>
        )}
        
        {isEditing ? (
          <div className="space-y-2">
            {multiline ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={value || ''}
                onChange={(e) => setData(prev => ({ ...prev, [field]: e.target.value }))}
                onBlur={(e) => {
                  // Don't blur if clicking on validate/cancel buttons
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  if (relatedTarget?.closest('.field-actions')) {
                    e.preventDefault();
                    inputRef.current?.focus();
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                rows={4}
                placeholder={`Entrez ${label.toLowerCase()}`}
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={value || ''}
                onChange={(e) => setData(prev => ({ ...prev, [field]: e.target.value }))}
                onBlur={(e) => {
                  // Don't blur if clicking on validate/cancel buttons
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  if (relatedTarget?.closest('.field-actions')) {
                    e.preventDefault();
                    inputRef.current?.focus();
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Entrez ${label.toLowerCase()}`}
              />
            )}
            {guidance && (
              <div className="text-xs text-slate-500 bg-blue-50 p-2 rounded">
                💡 {guidance}
              </div>
            )}
            <div className="flex gap-2 field-actions">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateField(field, data[field] as string);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Valider
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditingField(null);
                }}
                className="px-3 py-1 border border-slate-300 rounded text-sm hover:bg-slate-50"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="px-3 py-2 bg-slate-50 rounded-lg text-slate-700">
            {multiline ? (
              <p className="whitespace-pre-wrap">{displayValue}</p>
            ) : (
              <p>{displayValue}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            ✅ Vérifie et complète les informations
          </h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Required Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
              Champs requis
            </h3>
            
            <FieldDisplay
              label="Titre"
              field="title"
              value={data.title}
              required
            />

            <FieldDisplay
              label="Description du problème"
              field="problem_statement"
              value={data.problem_statement}
              required
              multiline
            />
          </div>

          {/* Category & Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
              Classification
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Catégorie
              </label>
              <select
                value={data.category || 'other'}
                onChange={(e) => setData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Localisation
              </label>
              <select
                value={data.location || 'other'}
                onChange={(e) => setData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {LOCATIONS.map(loc => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
              Informations complémentaires (optionnel)
            </h3>

            <FieldDisplay
              label="Solution proposée"
              field="proposed_solution"
              value={data.proposed_solution}
              multiline
            />

            <FieldDisplay
              label="Processus manuel actuel"
              field="current_manual_process"
              value={data.current_manual_process}
              multiline
              guidance="Décrivez comment le problème est résolu actuellement (manuellement). Ex: 'Les gens jettent les déchets dans la rue. La municipalité envoie des camions une fois par semaine.'"
            />

            <FieldDisplay
              label="Opportunité de numérisation"
              field="digitization_opportunity"
              value={data.digitization_opportunity}
              multiline
              guidance="Expliquez comment la technologie peut améliorer ce processus. Ex: 'Une app mobile pour signaler les déchets, avec système de points/récompenses pour motiver la participation citoyenne.'"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8 pt-6 border-t">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Soumettre l'idée
          </button>
        </div>
      </div>
    </div>
  );
}

