/**
 * Receipt Verification Component
 * 
 * Queue of flagged receipts with image viewer
 */

'use client';

import { useState, useEffect } from 'react';

interface Receipt {
  id: string;
  idea_id: string;
  idea_title: string;
  type: string;
  proof_url?: string;
  amount?: number;
  verified: boolean;
  flagged: boolean;
  flagged_reason?: string;
  created_at: string;
  submitter_name?: string;
}

export function ReceiptVerification() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, [showOnlyFlagged]);

  const fetchReceipts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        flagged: showOnlyFlagged ? 'true' : 'false',
      });
      const response = await fetch(`/api/admin/receipts?${params}`);
      const data = await response.json();
      setReceipts(data.receipts || []);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (receiptId: string, verified: boolean) => {
    try {
      await fetch(`/api/admin/receipts/${receiptId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified }),
      });
      fetchReceipts();
      if (selectedReceipt?.id === receiptId) {
        setSelectedReceipt(null);
      }
    } catch (error) {
      console.error('Error verifying receipt:', error);
    }
  };

  const handleBulkVerify = async (verified: boolean) => {
    const receiptIds = receipts.filter((r) => !r.verified).map((r) => r.id);
    try {
      await fetch('/api/admin/receipts/bulk-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptIds, verified }),
      });
      fetchReceipts();
    } catch (error) {
      console.error('Error bulk verifying:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Receipt Verification</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleBulkVerify(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Approve All
          </button>
          <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyFlagged}
              onChange={(e) => setShowOnlyFlagged(e.target.checked)}
              className="w-4 h-4 text-green-600"
            />
            <span className="text-sm">Show only flagged</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receipt Queue */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-lg border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">
              Queue ({receipts.filter((r) => !r.verified).length})
            </h3>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-slate-500">Loading...</div>
            ) : receipts.length === 0 ? (
              <div className="p-4 text-center text-slate-500">No receipts to verify</div>
            ) : (
              receipts.map((receipt) => (
                <button
                  key={receipt.id}
                  onClick={() => setSelectedReceipt(receipt)}
                  className={`w-full text-left p-4 border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                    selectedReceipt?.id === receipt.id ? 'bg-green-50 border-green-300' : ''
                  }`}
                >
                  <div className="font-medium text-slate-900 mb-1">{receipt.idea_title}</div>
                  <div className="text-sm text-slate-600">
                    {receipt.submitter_name || 'Anonymous'}
                  </div>
                  {receipt.flagged && (
                    <div className="text-xs text-red-600 mt-1">⚠️ Flagged</div>
                  )}
                  {receipt.verified && (
                    <div className="text-xs text-green-600 mt-1">✅ Verified</div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Receipt Viewer */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg border border-slate-200 p-6">
          {selectedReceipt ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {selectedReceipt.idea_title}
                </h3>
                <div className="text-sm text-slate-600 space-y-1">
                  <div>Type: {selectedReceipt.type}</div>
                  {selectedReceipt.amount && <div>Amount: {selectedReceipt.amount} DH</div>}
                  <div>Submitted: {new Date(selectedReceipt.created_at).toLocaleDateString()}</div>
                  {selectedReceipt.flagged_reason && (
                    <div className="text-red-600">Flagged: {selectedReceipt.flagged_reason}</div>
                  )}
                </div>
              </div>

              {selectedReceipt.proof_url && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Proof Image</h4>
                  <img
                    src={selectedReceipt.proof_url}
                    alt="Receipt proof"
                    className="max-w-full h-auto rounded-lg border border-slate-200"
                  />
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => handleVerify(selectedReceipt.id, true)}
                  disabled={selectedReceipt.verified}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => handleVerify(selectedReceipt.id, false)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  ❌ Reject
                </button>
                <button
                  onClick={() => {
                    // Mark as fraud
                    handleVerify(selectedReceipt.id, false);
                  }}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
                >
                  ⚠️ Flag Fraud
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12">
              Select a receipt from the queue to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

