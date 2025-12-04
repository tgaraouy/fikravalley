'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeanCanvasData } from '@/lib/ai/lean-canvas-generator';

interface LeanCanvasViewerProps {
  canvasData: LeanCanvasData;
  version?: number;
  onEdit?: () => void;
}

export function LeanCanvasViewer({ canvasData, version, onEdit }: LeanCanvasViewerProps) {
  return (
    <div className="space-y-4">
      {version && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Lean Canvas {version > 1 && `(Version ${version})`}</h3>
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Edit Canvas
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Row 1 */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Problem</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 whitespace-pre-line">{canvasData.problem}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Solution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 whitespace-pre-line">{canvasData.solution}</p>
          </CardContent>
        </Card>

        {/* Row 2 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 whitespace-pre-line">{canvasData.key_metrics}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Unique Value Proposition</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 font-medium">{canvasData.uvp}</p>
          </CardContent>
        </Card>

        {/* Row 3 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Unfair Advantage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 whitespace-pre-line">{canvasData.unfair_advantage}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 whitespace-pre-line">{canvasData.channels}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 whitespace-pre-line">{canvasData.customer_segments}</p>
          </CardContent>
        </Card>

        {/* Row 4 */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Cost Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 whitespace-pre-line">{canvasData.cost_structure}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Revenue Streams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 whitespace-pre-line">{canvasData.revenue_streams}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

