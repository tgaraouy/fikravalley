'use client';

import { useState } from 'react';
import { generateCustomerMessage } from '@/lib/ai/whatsapp-message-generator';

interface GenerateMessageButtonProps {
  ideaId: string;
  ideaTitle: string;
  problemStatement: string;
}

export function GenerateMessageButton({
  ideaId,
  ideaTitle,
  problemStatement,
}: GenerateMessageButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [paymentInstructions, setPaymentInstructions] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-customer-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea_id: ideaId,
          customer_name: customerName || undefined,
          amount: 3, // 3 DH for validation (assembly framework)
        }),
      });

      const data = await response.json();
      if (data.message) {
        setMessage(data.message);
        setPaymentLink(data.paymentLink || null);
        setPaymentInstructions(data.paymentInstructions || null);
        setShowModal(true);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error generating message:', error);
      }
      alert('Erreur lors de la génération du message. Réessaie.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (message) {
      navigator.clipboard.writeText(message);
      alert('Message copié ! Colle-le dans WhatsApp.');
    }
  };

  const openWhatsApp = () => {
    if (message) {
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    }
  };

  return (
    <>
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-md disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Génération...</span>
          </>
        ) : (
          <>
            <span className="text-lg">💬</span>
            <span>Générer message WhatsApp</span>
          </>
        )}
      </button>

      {showModal && message && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-slate-400 hover:text-slate-700 text-xl"
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Message WhatsApp généré
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Copie ce message et envoie-le à tes clients pour valider l'idée.
            </p>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
              <p className="text-slate-800 whitespace-pre-wrap font-medium">
                {message}
              </p>
            </div>
            
            {paymentInstructions && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">Instructions de paiement:</p>
                <p className="text-sm text-blue-800 whitespace-pre-wrap">
                  {paymentInstructions}
                </p>
                {paymentLink && (
                  <a
                    href={paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
                  >
                    Ouvrir lien de paiement →
                  </a>
                )}
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
              >
                📋 Copier message
              </button>
              <button
                onClick={openWhatsApp}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                💬 Ouvrir WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

