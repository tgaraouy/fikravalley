/**
 * API: Export Reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { MOROCCO_PRIORITIES } from '@/lib/idea-bank/scoring/morocco-priorities';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'ideas';
    const format = searchParams.get('format') || 'csv';
    const range = searchParams.get('range') || 'all';

    const supabase = await createClient();

    // Calculate date range
    let dateFilter: any = {};
    if (range !== 'all') {
      const now = new Date();
      const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - daysAgo);
      dateFilter = { gte: startDate.toISOString() };
    }

    // Fetch data based on type
    let data: any[] = [];
    let reportTitle = '';
    
    if (type === 'ideas') {
      const { data: ideas } = await supabase
        .from('marrai_ideas')
        .select('*')
        .gte('created_at', dateFilter.gte || '1970-01-01');
      data = ideas || [];
      reportTitle = 'Ideas Report';
    } else if (type === 'morocco_priorities') {
      // Morocco Priority Report - priority-focused for Morocco Gov
      const { data: ideas } = await supabase
        .from('marrai_ideas')
        .select('id, title, problem_statement, alignment, created_at, total_score')
        .gte('created_at', dateFilter.gte || '1970-01-01');
      
      // Group by priorities
      const priorityGroups: Record<string, any[]> = {};
      MOROCCO_PRIORITIES.forEach(priority => {
        priorityGroups[priority.id] = [];
      });
      
      (ideas || []).forEach((idea: any) => {
        let alignment = null;
        if (idea.alignment) {
          if (typeof idea.alignment === 'string') {
            try {
              alignment = JSON.parse(idea.alignment);
            } catch {
              alignment = null;
            }
          } else {
            alignment = idea.alignment;
          }
        }
        
        if (alignment && alignment.moroccoPriorities) {
          alignment.moroccoPriorities.forEach((priorityId: string) => {
            if (!priorityGroups[priorityId]) priorityGroups[priorityId] = [];
            priorityGroups[priorityId].push({
              ...idea,
              alignment,
            });
          });
        }
      });
      
      // Format for report
      data = MOROCCO_PRIORITIES.map(priority => ({
        priority: priority.name,
        priority_id: priority.id,
        description: priority.description,
        idea_count: priorityGroups[priority.id]?.length || 0,
        ideas: priorityGroups[priority.id]?.map(i => ({
          title: i.title,
          problem: i.problem_statement?.substring(0, 100),
          score: i.total_score || 0,
        })) || [],
      })).filter(p => p.idea_count > 0);
      
      reportTitle = 'Morocco Priority Report';
    } else if (type === 'sdg_coverage') {
      // SDG Coverage Report - SDG-focused for UN/EU
      const { data: ideas } = await supabase
        .from('marrai_ideas')
        .select('id, title, problem_statement, alignment, created_at, total_score')
        .gte('created_at', dateFilter.gte || '1970-01-01');
      
      // Group by SDGs
      const sdgGroups: Record<number, any[]> = {};
      const sdgTitles: Record<number, string> = {
        1: 'No Poverty', 2: 'Zero Hunger', 3: 'Good Health',
        4: 'Quality Education', 5: 'Gender Equality', 6: 'Clean Water',
        7: 'Clean Energy', 8: 'Decent Work', 9: 'Innovation',
        10: 'Reduced Inequality', 11: 'Sustainable Cities',
        12: 'Responsible Consumption', 13: 'Climate Action',
        14: 'Life Below Water', 15: 'Life on Land',
        16: 'Peace & Justice', 17: 'Partnerships',
      };
      
      (ideas || []).forEach((idea: any) => {
        let alignment = null;
        if (idea.alignment) {
          if (typeof idea.alignment === 'string') {
            try {
              alignment = JSON.parse(idea.alignment);
            } catch {
              alignment = null;
            }
          } else {
            alignment = idea.alignment;
          }
        }
        
        const sdgs = alignment?.sdgTags || [];
        sdgs.forEach((sdg: number) => {
          if (!sdgGroups[sdg]) sdgGroups[sdg] = [];
          sdgGroups[sdg].push({
            ...idea,
            alignment,
          });
        });
      });
      
      // Format for report
      data = Object.keys(sdgGroups).map(sdgStr => {
        const sdg = parseInt(sdgStr);
        return {
          sdg: sdg,
          sdg_title: sdgTitles[sdg] || `SDG ${sdg}`,
          idea_count: sdgGroups[sdg]?.length || 0,
          ideas: sdgGroups[sdg]?.map(i => ({
            title: i.title,
            problem: i.problem_statement?.substring(0, 100),
            score: i.total_score || 0,
            morocco_priorities: i.alignment?.moroccoPriorities || [],
          })) || [],
        };
      }).filter(s => s.idea_count > 0).sort((a, b) => a.sdg - b.sdg);
      
      reportTitle = 'UN SDG Coverage Report';
    } else if (type === 'users') {
      // Simplified - would need proper user table
      data = [];
      reportTitle = 'Users Report';
    } else {
      reportTitle = `${type} Report`;
    }

    // Convert to CSV (simplified)
    if (format === 'csv') {
      if (data.length === 0) {
        return new NextResponse('No data', { status: 404 });
      }

      let csv = '';
      
      if (type === 'morocco_priorities') {
        // Morocco Priority Report CSV
        csv = [
          'Priority,Priority ID,Description,Idea Count',
          ...data.map((row: any) => [
            row.priority,
            row.priority_id,
            `"${row.description}"`,
            row.idea_count,
          ].join(',')),
        ].join('\n');
      } else if (type === 'sdg_coverage') {
        // SDG Coverage Report CSV
        csv = [
          'SDG,SDG Title,Idea Count',
          ...data.map((row: any) => [
            row.sdg,
            `"${row.sdg_title}"`,
            row.idea_count,
          ].join(',')),
        ].join('\n');
      } else {
        // Standard CSV export
        const headers = Object.keys(data[0]).filter(h => h !== 'ideas' && h !== 'alignment');
        csv = [
          headers.join(','),
          ...data.map((row: any) =>
            headers.map((h) => {
              const value = row[h];
              if (value === null || value === undefined) return '';
              if (typeof value === 'object') return JSON.stringify(value);
              return JSON.stringify(String(value));
            }).join(',')
          ),
        ].join('\n');
      }

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.csv"`,
        },
      });
    }

    // For Excel/PDF, would need libraries like exceljs or pdfkit
    return NextResponse.json({ error: 'Format not yet implemented' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting report:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}

