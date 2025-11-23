'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { saveVoiceDraft } from '@/lib/voice/offline-storage';

interface WhatsAppImportProps {
    onImport: (blob: Blob) => void;
}

export default function WhatsAppImport({ onImport }: WhatsAppImportProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImport(file);
        }
    };

    return (
        <div className="w-full">
            {!isExpanded ? (
                <Button
                    variant="outline"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50 flex items-center gap-2"
                    onClick={() => setIsExpanded(true)}
                >
                    <span>📲</span> Importer un audio WhatsApp
                </Button>
            ) : (
                <Card className="border-2 border-green-200 bg-green-50/50">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-green-900">Comment importer?</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-green-700"
                                onClick={() => setIsExpanded(false)}
                            >
                                ✕
                            </Button>
                        </div>

                        <ol className="text-sm text-green-800 space-y-2 list-decimal pl-4">
                            <li>Ouvre WhatsApp et trouve ton vocal.</li>
                            <li>Appuie longuement sur le vocal → <strong>Partager</strong>.</li>
                            <li>Choisis <strong>Fikra Valley</strong> dans la liste.</li>
                        </ol>

                        <div className="text-center text-xs text-green-600 font-medium py-1">
                            — OU —
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-green-800">
                                Sauvegarde le fichier et sélectionne-le ici:
                            </p>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-100 file:text-green-700
                  hover:file:bg-green-200
                "
                            />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
