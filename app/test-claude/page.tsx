'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ClaudeTestResult {
  success: boolean;
  message: string;
  env_check?: {
    ANTHROPIC_API_KEY: boolean;
    keyPreview?: string | null;
  };
  api_connected?: boolean;
  timestamp?: string;
  error?: {
    status?: number;
    statusText?: string;
    message?: string;
    name?: string;
  };
  diagnosis?: {
    issue?: string;
    possible_causes?: string[];
    solutions?: string[];
  };
  test_details?: {
    model?: string;
    prompt?: string;
    response?: string;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      total_tokens?: number;
    };
    response_id?: string;
    stop_reason?: string;
  };
}

export default function TestClaudePage() {
  const [result, setResult] = useState<ClaudeTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-claude', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to connect to test endpoint',
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
          <CardTitle className="text-2xl font-bold">Claude API Integration Test</CardTitle>
          <CardDescription>Verify your Anthropic Claude API connection and diagnose issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={runTest} disabled={isLoading} variant="primary" size="lg">
            {isLoading ? 'Testing Claude API...' : 'Run Test Again'}
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
                  {result.success ? '✅ API Connection Successful' : '❌ API Connection Failed'}
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
                    <CardTitle className="text-lg">Environment Variable</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ANTHROPIC_API_KEY:</span>
                      <span
                        className={`text-sm font-semibold ${
                          result.env_check.ANTHROPIC_API_KEY ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {result.env_check.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing'}
                      </span>
                    </div>
                    {result.env_check.keyPreview && (
                      <p className="mt-2 text-xs text-slate-500">
                        Key Preview: {result.env_check.keyPreview}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-slate-400">
                      Note: This key should be server-side only (not NEXT_PUBLIC_)
                    </p>
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
                    {result.error.status && (
                      <div>
                        <span className="font-semibold">Status:</span> {result.error.status}
                      </div>
                    )}
                    {result.error.statusText && (
                      <div>
                        <span className="font-semibold">Status Text:</span> {result.error.statusText}
                      </div>
                    )}
                    {result.error.name && (
                      <div>
                        <span className="font-semibold">Error Type:</span> {result.error.name}
                      </div>
                    )}
                    {result.error.message && (
                      <div>
                        <span className="font-semibold">Message:</span> {result.error.message}
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
              {result.success && result.test_details && (
                <>
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Test Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <span className="font-semibold">Model:</span> {result.test_details.model}
                      </div>
                      {result.test_details.response_id && (
                        <div>
                          <span className="font-semibold">Response ID:</span>{' '}
                          <span className="font-mono text-xs">{result.test_details.response_id}</span>
                        </div>
                      )}
                      {result.test_details.stop_reason && (
                        <div>
                          <span className="font-semibold">Stop Reason:</span>{' '}
                          {result.test_details.stop_reason}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {result.test_details.usage && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Token Usage</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Input Tokens:</span>
                          <span className="font-semibold">{result.test_details.usage.input_tokens}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Output Tokens:</span>
                          <span className="font-semibold">{result.test_details.usage.output_tokens}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-blue-300 pt-2">
                          <span className="font-semibold">Total Tokens:</span>
                          <span className="font-bold">{result.test_details.usage.total_tokens}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {result.test_details.prompt && (
                    <Card className="border-indigo-200 bg-indigo-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Test Prompt</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm italic text-slate-700">{result.test_details.prompt}</p>
                      </CardContent>
                    </Card>
                  )}

                  {result.test_details.response && (
                    <Card className="border-emerald-200 bg-emerald-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Claude Response</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-lg border border-emerald-200 bg-white p-4">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {result.test_details.response}
                          </p>
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

