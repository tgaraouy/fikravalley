/**
 * AI Agents Management Page
 * 
 * Central hub for all agent tools
 */

'use client';

import { useState } from 'react';
import SpecGenerator from '@/components/agents/SpecGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            🤖 AI Agents - Manager of Work
          </h1>
          <p className="text-lg text-slate-600">
            Outils d'orchestration et de génération pour le marché marocain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Spec Generator */}
          <SpecGenerator />

          {/* Codebase Analyzer */}
          <Card>
            <CardHeader>
              <CardTitle>🔍 Analyse du Codebase</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Identifie les capacités offline, les endpoints API, et les points d'insertion de retry logic.
              </p>
              <Button asChild className="w-full">
                <Link href="/api/agents/codebase-analysis">
                  Analyser le Codebase
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Distribution Channels */}
          <Card>
            <CardHeader>
              <CardTitle>📢 Canaux de Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Identifie les canaux WhatsApp, Facebook, et physiques pour ton idée.
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/agents/distribution">
                  Mapper les Canaux
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Agent Orchestration */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Orchestration Multi-Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Coordonne plusieurs agents avec gestion de conflits et handoffs.
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/agents/orchestrate">
                  Orchestrer les Agents
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Error Translator */}
          <Card>
            <CardHeader>
              <CardTitle>🌐 Traducteur d'Erreurs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Traduit les erreurs techniques en Darija avec étapes actionnables.
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/agents/error-translate">
                  Traduire une Erreur
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Micro-Module Generator */}
          <Card>
            <CardHeader>
              <CardTitle>🎬 Générateur de Micro-Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Crée des scripts vidéo de 60 secondes en Darija avec sous-titres.
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/agents/micro-module">
                  Générer un Module
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

