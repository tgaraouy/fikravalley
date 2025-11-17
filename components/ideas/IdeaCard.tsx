/**
 * Idea Card Component
 * 
 * Displays an idea in a card format with all key information
 */

import Link from 'next/link';
// Icons - using simple SVG or text for now

interface Idea {
  id: string;
  title: string;
  title_darija?: string;
  problem_statement: string;
  proposed_solution?: string;
  location: string;
  category: string;
  total_score?: number;
  stage1_total?: number;
  stage2_total?: number;
  receipt_count?: number;
  upvote_count?: number;
  sdg_alignment?: number[];
  funding_status?: string;
  qualification_tier?: 'exceptional' | 'qualified' | 'developing';
  created_at: string;
  submitter_name?: string;
  has_receipts?: boolean;
}

interface IdeaCardProps {
  idea: Idea;
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-slate-100 text-slate-800';
    if (score >= 30) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (score >= 25) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 20) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  const getQualificationLabel = (tier?: string) => {
    switch (tier) {
      case 'exceptional':
        return 'Exceptional';
      case 'qualified':
        return 'Qualified';
      case 'developing':
        return 'Developing';
      default:
        return 'In Review';
    }
  };

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const displayTitle = idea.title_darija || idea.title;
  const displayDescription = truncate(
    idea.proposed_solution || idea.problem_statement,
    150
  );

  return (
    <Link href={`/ideas/${idea.id}`}>
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-slate-200 hover:border-green-300 h-full flex flex-col group">
        {/* Header: Score + Upvotes */}
        <div className="flex justify-between items-start mb-4">
          <div
            className={`px-3 py-1.5 rounded-full text-sm font-bold border-2 ${getScoreColor(
              idea.total_score || idea.stage2_total
            )}`}
          >
            {(idea.total_score || idea.stage2_total || 0)}/40
          </div>
          <div className="flex items-center gap-1 text-slate-500 group-hover:text-red-500 transition-colors">
            <span className="text-sm">❤️</span>
            <span className="text-sm font-semibold">{idea.upvote_count || 0}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-green-600 transition-colors line-clamp-2">
          {displayTitle}
        </h3>

        {/* Description */}
        <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow">
          {displayDescription}
        </p>

        {/* Meta Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {idea.has_receipts && idea.receipt_count && idea.receipt_count > 0 && (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-medium">
              📝 {idea.receipt_count} validated
            </span>
          )}
          {idea.sdg_alignment && idea.sdg_alignment.slice(0, 3).map((sdg) => (
            <span
              key={sdg}
              className="text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-medium"
            >
              SDG {sdg}
            </span>
          ))}
          {idea.qualification_tier && (
            <span className="text-xs bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full font-medium">
              {getQualificationLabel(idea.qualification_tier)}
            </span>
          )}
        </div>

        {/* Footer: Location + Category */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-1">
            <span>📍</span>
            <span>{idea.location || 'Morocco'}</span>
          </div>
          <span className="capitalize">{idea.category}</span>
        </div>

        {/* CTA Button */}
        <button className="mt-4 w-full py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors group-hover:shadow-lg">
          View Details
        </button>
      </div>
    </Link>
  );
}

