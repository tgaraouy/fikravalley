'use client';

import { useState, useEffect } from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, ExclamationTriangleIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface MarketAnalysis {
  analyzed_at?: string;
  market_size?: {
    value?: string;
    unit?: string;
    description?: string;
  };
  competitors?: Array<{
    name?: string;
    description?: string;
    market_share?: string;
  }>;
  trends?: string[];
  potential?: {
    short_term?: string;
    long_term?: string;
    scalability?: string;
  };
  risks?: Array<{
    type?: string;
    description?: string;
    mitigation?: string;
  }>;
  opportunities?: Array<{
    area?: string;
    description?: string;
    impact?: string;
  }>;
  sources?: Array<{
    title?: string;
    url?: string;
    type?: string;
  }>;
  confidence_score?: number;
}

interface MarketAnalysisSectionProps {
  ideaId: string;
  ideaTitle: string;
  problemStatement: string;
  proposedSolution?: string;
  category?: string;
  location?: string;
}

export function MarketAnalysisSection({
  ideaId,
  ideaTitle,
  problemStatement,
  proposedSolution,
  category,
  location,
}: MarketAnalysisSectionProps) {
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, [ideaId]);

  const fetchAnalysis = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/ideas/${ideaId}`);
      const data = await response.json();
      
      if (data.ai_market_analysis) {
        setAnalysis(data.ai_market_analysis);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load market analysis');
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching market analysis:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateAnalysis = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await fetch(`/api/ideas/${ideaId}/market-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate analysis');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to generate market analysis');
      if (process.env.NODE_ENV === 'development') {
        console.error('Error generating market analysis:', err);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <ChartBarIcon className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold">Market Analysis</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          Loading market analysis...
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold">Market Analysis</h2>
          </div>
        </div>
        
        <div className="text-center py-8">
          <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            No market analysis available yet. Generate one to see market size, competitors, trends, and opportunities.
          </p>
          <button
            onClick={generateAnalysis}
            disabled={isGenerating}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Generating...
              </>
            ) : (
              'Generate Market Analysis'
            )}
          </button>
          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    );
  }

  const confidencePercentage = Math.round((analysis.confidence_score || 0) * 100);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold">Market Analysis</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Confidence:</span>
          <span className={`text-sm font-semibold ${
            confidencePercentage >= 80 ? 'text-green-600' :
            confidencePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {confidencePercentage}%
          </span>
        </div>
      </div>

      {analysis.analyzed_at && (
        <p className="text-sm text-gray-500">
          Analyzed on {new Date(analysis.analyzed_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      )}

      {/* Market Size */}
      {analysis.market_size && (
        <div className="border-l-4 border-green-500 pl-4">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
            Market Size
          </h3>
          {analysis.market_size.value && (
            <p className="text-2xl font-bold text-green-600 mb-1">
              {analysis.market_size.value} {analysis.market_size.unit || 'DH'}
            </p>
          )}
          {analysis.market_size.description && (
            <p className="text-gray-700">{analysis.market_size.description}</p>
          )}
        </div>
      )}

      {/* Competitors */}
      {analysis.competitors && analysis.competitors.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-3">Competitors</h3>
          <div className="space-y-3">
            {analysis.competitors.map((competitor, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{competitor.name || 'Unknown'}</h4>
                    {competitor.description && (
                      <p className="text-sm text-gray-600 mt-1">{competitor.description}</p>
                    )}
                  </div>
                  {competitor.market_share && (
                    <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded">
                      {competitor.market_share}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends */}
      {analysis.trends && analysis.trends.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-3">Market Trends</h3>
          <ul className="space-y-2">
            {analysis.trends.map((trend, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-gray-700">{trend}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Potential */}
      {analysis.potential && (
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <LightBulbIcon className="w-5 h-5 text-green-600" />
            Potential
          </h3>
          <div className="space-y-3">
            {analysis.potential.short_term && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Short-term (0-6 months)</h4>
                <p className="text-sm text-gray-700">{analysis.potential.short_term}</p>
              </div>
            )}
            {analysis.potential.long_term && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Long-term (6+ months)</h4>
                <p className="text-sm text-gray-700">{analysis.potential.long_term}</p>
              </div>
            )}
            {analysis.potential.scalability && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Scalability</h4>
                <p className="text-sm text-gray-700">{analysis.potential.scalability}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risks */}
      {analysis.risks && analysis.risks.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
            Risks
          </h3>
          <div className="space-y-3">
            {analysis.risks.map((risk, idx) => (
              <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {risk.type && (
                      <span className="text-xs font-semibold text-yellow-800 bg-yellow-200 px-2 py-1 rounded mb-2 inline-block">
                        {risk.type}
                      </span>
                    )}
                    {risk.description && (
                      <p className="text-sm text-gray-700 mt-1">{risk.description}</p>
                    )}
                    {risk.mitigation && (
                      <p className="text-xs text-gray-600 mt-2">
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opportunities */}
      {analysis.opportunities && analysis.opportunities.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <LightBulbIcon className="w-5 h-5 text-green-600" />
            Opportunities
          </h3>
          <div className="space-y-3">
            {analysis.opportunities.map((opp, idx) => (
              <div key={idx} className="bg-green-50 rounded-lg p-4">
                {opp.area && (
                  <h4 className="font-semibold text-gray-900 mb-1">{opp.area}</h4>
                )}
                {opp.description && (
                  <p className="text-sm text-gray-700 mb-1">{opp.description}</p>
                )}
                {opp.impact && (
                  <p className="text-xs text-green-700 font-medium">
                    Impact: {opp.impact}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {analysis.sources && analysis.sources.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-3">Sources</h3>
          <ul className="space-y-2">
            {analysis.sources.map((source, idx) => (
              <li key={idx} className="text-sm">
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 underline"
                  >
                    {source.title || source.url}
                  </a>
                ) : (
                  <span className="text-gray-700">{source.title}</span>
                )}
                {source.type && (
                  <span className="text-gray-500 ml-2">({source.type})</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Regenerate Button */}
      <div className="pt-4 border-t">
        <button
          onClick={generateAnalysis}
          disabled={isGenerating}
          className="text-sm text-green-600 hover:text-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Regenerating...' : '🔄 Regenerate Analysis'}
        </button>
      </div>
    </div>
  );
}

