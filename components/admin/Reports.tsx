/**
 * Reports Component
 * 
 * Export and analytics
 */

'use client';

import { useState } from 'react';

export function Reports() {
  const [reportType, setReportType] = useState('ideas');
  const [dateRange, setDateRange] = useState('all');

  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      const response = await fetch(
        `/api/admin/reports/export?type=${reportType}&format=${format}&range=${dateRange}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportType}-${Date.now()}.${format}`;
      a.click();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const exportMoroccoReport = async () => {
    try {
      const response = await fetch(
        `/api/admin/reports/export?type=morocco_priorities&format=pdf&range=${dateRange}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `morocco-priority-report-${Date.now()}.pdf`;
      a.click();
    } catch (error) {
      console.error('Error exporting Morocco report:', error);
    }
  };

  const exportSDGReport = async () => {
    try {
      const response = await fetch(
        `/api/admin/reports/export?type=sdg_coverage&format=pdf&range=${dateRange}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `un-sdg-report-${Date.now()}.pdf`;
      a.click();
    } catch (error) {
      console.error('Error exporting SDG report:', error);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900">Reports & Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Report Configuration */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow border border-slate-200 p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 sm:mb-3">Report Settings</h3>
          <div className="space-y-2 sm:space-y-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              >
                <option value="ideas">Ideas</option>
                <option value="users">Users</option>
                <option value="receipts">Receipts</option>
                <option value="funding">Funding Pipeline</option>
                <option value="sectors">Sector Analysis</option>
                <option value="geographic">Geographic Distribution</option>
                <option value="morocco_priorities">Morocco Priorities</option>
                <option value="sdg_coverage">SDG Coverage</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <button
                onClick={() => handleExport('excel')}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-green-600 text-white rounded text-xs sm:text-sm hover:bg-green-700 font-medium"
              >
                📊 Excel
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 text-white rounded text-xs sm:text-sm hover:bg-blue-700 font-medium"
              >
                📄 CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600 text-white rounded text-xs sm:text-sm hover:bg-red-700 font-medium"
              >
                📑 PDF
              </button>
            </div>

            {/* Strategic Alignment Reports */}
            <div className="pt-2 sm:pt-3 border-t border-slate-200">
              <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">Strategic Reports</h4>
              <div className="space-y-1.5 sm:space-y-2">
                <button
                  onClick={exportMoroccoReport}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-green-700 text-white rounded text-xs sm:text-sm hover:bg-green-800 font-medium flex items-center justify-center gap-1.5"
                >
                  <span>🇲🇦</span>
                  <span className="hidden sm:inline">Morocco Priority</span>
                  <span className="sm:hidden">Morocco</span>
                </button>
                <button
                  onClick={exportSDGReport}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-700 text-white rounded text-xs sm:text-sm hover:bg-blue-800 font-medium flex items-center justify-center gap-1.5"
                >
                  <span>🌍</span>
                  <span className="hidden sm:inline">UN SDG Report</span>
                  <span className="sm:hidden">SDG</span>
                </button>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 hidden sm:block">
                Different reports for different audiences
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Preview */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow border border-slate-200 p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 sm:mb-3">Analytics Preview</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-600">Total Ideas</div>
                <div className="text-lg sm:text-xl font-bold text-slate-900">1,234</div>
              </div>
              <div className="p-2 sm:p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-600">Verified Receipts</div>
                <div className="text-lg sm:text-xl font-bold text-slate-900">567</div>
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-600 mb-1.5">Sector Distribution</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Health</span>
                  <span className="font-semibold">45%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Education</span>
                  <span className="font-semibold">30%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Agriculture</span>
                  <span className="font-semibold">25%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

