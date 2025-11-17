'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type ConversationIdeaRow = Database['public']['Tables']['marrai_conversation_ideas']['Row'];

interface QRCodeData {
  idea: ConversationIdeaRow;
  qrDataUrl: string;
  validationUrl: string;
  shortId: string;
}

export default function QRCodePrintPage() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAndGenerateQRCodes() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all pending conversation ideas
        const { data: ideas, error: fetchError } = await supabase
          .from('marrai_conversation_ideas')
          .select('*')
          .eq('status', 'pending_validation')
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (!ideas || ideas.length === 0) {
          setError('Aucune idée en attente de validation');
          setIsLoading(false);
          return;
        }

        // Generate QR codes for each idea
        const baseUrl = window.location.origin;
        const qrCodePromises = ideas.map(async (idea) => {
          const validationUrl = `${baseUrl}/validate?idea=${idea.id}`;
          const shortId = idea.id.substring(0, 8).toUpperCase();

          try {
            const qrDataUrl = await QRCode.toDataURL(validationUrl, {
              width: 200,
              margin: 1,
              color: {
                dark: '#000000',
                light: '#FFFFFF',
              },
            });

            return {
              idea,
              qrDataUrl,
              validationUrl,
              shortId,
            };
          } catch (qrError) {
            console.error(`Error generating QR for idea ${idea.id}:`, qrError);
            return null;
          }
        });

        const qrCodeResults = await Promise.all(qrCodePromises);
        const validQRCodes = qrCodeResults.filter((qr): qr is QRCodeData => qr !== null);

        setQrCodes(validQRCodes);
      } catch (err) {
        console.error('Error fetching ideas:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des idées');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAndGenerateQRCodes();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <Card className="border-white/80 bg-white/95">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
              <p className="text-slate-600">Génération des QR codes...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Screen View - Controls */}
      <div className="mx-auto w-full max-w-6xl px-6 py-6 print:hidden">
        <Card className="border-white/80 bg-white/95">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">QR Codes pour Validation</CardTitle>
            <CardDescription>
              {qrCodes.length} idée{qrCodes.length !== 1 ? 's' : ''} en attente de validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button onClick={handlePrint} variant="primary" size="lg">
                🖨️ Imprimer
              </Button>
              <p className="text-sm text-slate-600">
                Format optimisé pour papier A4. 16 QR codes par page (4x4).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print View - QR Code Grid */}
      <div className="mx-auto w-full max-w-[210mm] px-0 print:max-w-none">
        <div className="qr-grid grid grid-cols-4 gap-4 p-8 print:grid-cols-4 print:gap-6 print:p-[15mm]">
          {qrCodes.map((qrData, index) => (
            <div
              key={qrData.idea.id}
              className="qr-cell flex flex-col items-center justify-center border border-slate-300 bg-white p-3 print:border-2 print:border-slate-400 print:p-4"
            >
              {/* QR Code */}
              <div className="mb-2 flex items-center justify-center">
                <img
                  src={qrData.qrDataUrl}
                  alt={`QR Code pour ${qrData.idea.problem_title || 'Idée'}`}
                  className="h-32 w-32 print:h-36 print:w-36"
                />
              </div>

              {/* Short ID */}
              <div className="mb-1 text-center">
                <span className="text-xs font-mono font-bold text-slate-900 print:text-sm">
                  {qrData.shortId}
                </span>
              </div>

              {/* Idea Title */}
              <div className="text-center">
                <p className="text-[10px] leading-tight text-slate-700 print:text-xs print:leading-snug">
                  {qrData.idea.problem_title || 'Sans titre'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }

          body {
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Hide everything except QR codes */
          body > *:not(.qr-grid):not(script) {
            display: none !important;
          }

          /* Ensure QR grid is visible */
          .qr-grid {
            display: grid !important;
            page-break-inside: avoid;
          }

          /* Page breaks */
          .qr-cell:nth-child(16n) {
            page-break-after: always;
          }

          /* Ensure cells don't break across pages */
          .qr-cell {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* Black and white printing */
          .qr-cell {
            border-color: #000000 !important;
            background: white !important;
          }

          .qr-cell img {
            filter: none !important;
            -webkit-filter: none !important;
          }

          /* Remove shadows and colors for printing */
          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }
        }

        /* Screen styles */
        @media screen {
          .qr-grid {
            background: #f8fafc;
            min-height: 100vh;
          }

          .qr-cell {
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
          }

          .qr-cell:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>
    </>
  );
}

