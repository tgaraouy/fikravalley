'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface HealthCheckResult {
  success: boolean;
  message: string;
  env_check?: {
    NEXT_PUBLIC_SUPABASE_URL: boolean;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: boolean;
    isConfigured: boolean;
    urlPreview?: string | null;
  };
  database_connected?: boolean;
  timestamp?: string;
  error?: {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  };
  diagnosis?: {
    issue?: string;
    code?: string;
    possible_causes?: string[];
    solutions?: string[];
  };
  table_count?: number;
  record_count?: number;
  sample_data?: Array<{
    id: string;
    name?: string | null;
    name_french?: string | null;
    created_at?: string | null;
  }>;
}

export default function TestSupabasePage() {
  const [result, setResult] = useState<HealthCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to connect to health check endpoint',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <Card className="border-white/80 bg-white/95">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Supabase Connection Test</CardTitle>
          <CardDescription>Verify your Supabase connection and diagnose issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={runTest} disabled={isLoading} variant="primary" size="lg">
            {isLoading ? 'Testing...' : 'Run Test Again'}
          </Button>

          {result && (
            <div className="space-y-4">
              {/* Status */}
              <div
                className={`rounded-lg border-2 p-4 ${
                  result.success
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <h3 className="mb-2 font-semibold">
                  {result.success ? '✅ Connection Successful' : '❌ Connection Failed'}
                </h3>
                <p className="text-sm">{result.message}</p>
                {result.timestamp && (
                  <p className="mt-2 text-xs text-slate-500">Tested at: {result.timestamp}</p>
                )}
              </div>

              {/* Environment Check */}
              {result.env_check && (
                <Card className="border-slate-200 bg-slate-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Environment Variables</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">NEXT_PUBLIC_SUPABASE_URL:</span>
                      <span
                        className={`text-sm font-semibold ${
                          result.env_check.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {result.env_check.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                      <span
                        className={`text-sm font-semibold ${
                          result.env_check.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {result.env_check.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
                      </span>
                    </div>
                    {result.env_check.urlPreview && (
                      <p className="mt-2 text-xs text-slate-500">
                        URL Preview: {result.env_check.urlPreview}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Error Details */}
              {result.error && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-900">Error Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {result.error.code && (
                      <div>
                        <span className="font-semibold">Code:</span> {result.error.code}
                      </div>
                    )}
                    {result.error.message && (
                      <div>
                        <span className="font-semibold">Message:</span> {result.error.message}
                      </div>
                    )}
                    {result.error.details && (
                      <div>
                        <span className="font-semibold">Details:</span> {result.error.details}
                      </div>
                    )}
                    {result.error.hint && (
                      <div>
                        <span className="font-semibold">Hint:</span> {result.error.hint}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Diagnosis */}
              {result.diagnosis && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-yellow-900">Diagnosis & Solutions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {result.diagnosis.issue && (
                      <div>
                        <span className="font-semibold">Issue:</span> {result.diagnosis.issue}
                      </div>
                    )}
                    {result.diagnosis.possible_causes && result.diagnosis.possible_causes.length > 0 && (
                      <div>
                        <span className="font-semibold">Possible Causes:</span>
                        <ul className="ml-4 mt-1 list-disc">
                          {result.diagnosis.possible_causes.map((cause, i) => (
                            <li key={i}>{cause}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.diagnosis.solutions && result.diagnosis.solutions.length > 0 && (
                      <div>
                        <span className="font-semibold">Solutions:</span>
                        <ul className="ml-4 mt-1 list-disc">
                          {result.diagnosis.solutions.map((solution, i) => (
                            <li key={i}>{solution}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Success Info */}
              {result.success && (
                <>
                  {result.table_count !== undefined && (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="pt-6">
                        <div className="text-sm">
                          <span className="font-semibold">Tables Found:</span> {result.table_count} / 6
                        </div>
                        {result.record_count !== undefined && (
                          <div className="mt-2 text-sm">
                            <span className="font-semibold">Sample Records:</span> {result.record_count}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {result.sample_data && result.sample_data.length > 0 && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Sample Data</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {result.sample_data.map((session) => (
                            <div key={session.id} className="rounded border border-blue-200 bg-white p-3 text-sm">
                              <div className="font-semibold">ID: {session.id}</div>
                              {session.name && <div>Name: {session.name}</div>}
                              {session.name_french && <div>Name (FR): {session.name_french}</div>}
                              {session.created_at && (
                                <div className="text-xs text-slate-500">
                                  Created: {new Date(session.created_at).toLocaleString('fr-FR')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

