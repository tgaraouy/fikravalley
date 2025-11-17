'use client';

/**
 * Step 5: Evidence
 * 
 * Photo upload with OCR and Barid Cash verification
 */

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Step5EvidenceProps {
  photos: File[];
  onPhotosChange: (files: File[]) => void;
  ocrText: string;
  onOcrTextChange: (text: string) => void;
  baridCashVerified: boolean;
  onBaridCashVerify: () => void;
}

export default function Step5Evidence({
  photos,
  onPhotosChange,
  ocrText,
  onOcrTextChange,
  baridCashVerified,
  onBaridCashVerify,
}: Step5EvidenceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    onPhotosChange([...photos, ...files]);

    // Simulate OCR processing
    if (files.length > 0) {
      setIsProcessingOcr(true);
      // TODO: Implement actual OCR
      setTimeout(() => {
        setIsProcessingOcr(false);
        onOcrTextChange('Texte extrait de l\'image (simulation OCR)');
      }, 2000);
    }

    setIsUploading(false);
  };

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">5. Preuves et documentation</h2>
        <p className="text-slate-600 mt-1">Ajoutez des photos, documents ou preuves</p>
      </div>

      {/* Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Photos et documents</CardTitle>
          <CardDescription>
            Téléchargez des photos du problème, des documents, ou des captures d'écran
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? 'Téléchargement...' : '+ Ajouter des photos/documents'}
            </Button>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {photo.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <p className="text-sm font-medium">📄 {photo.name}</p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePhoto(index)}
                  >
                    ✗
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* OCR Results */}
      {isProcessingOcr && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-blue-800">Traitement OCR en cours...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {ocrText && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900 text-sm">📝 Texte extrait (OCR)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-800">{ocrText}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOcrTextChange('')}
              className="mt-2"
            >
              Effacer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Barid Cash Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Vérification Barid Cash (optionnel)</CardTitle>
          <CardDescription>
            Vérifiez votre identité avec Barid Cash pour renforcer la crédibilité
          </CardDescription>
        </CardHeader>
        <CardContent>
          {baridCashVerified ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <Badge className="bg-green-600 text-white">✓ Vérifié</Badge>
              <p className="text-green-800">Votre identité a été vérifiée avec Barid Cash</p>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={onBaridCashVerify}
              className="w-full"
            >
              Vérifier avec Barid Cash
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Optional Note */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="pt-6">
          <p className="text-sm text-slate-600 text-center">
            💡 Cette étape est optionnelle mais peut renforcer votre soumission
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

