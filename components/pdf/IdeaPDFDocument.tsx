import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Database } from '@/lib/supabase';
import { formatDate, formatCurrency } from '@/lib/utils';

type IdeaRow = Database['public']['Tables']['marrai_ideas']['Row'];
type AgentSolutionRow = Database['public']['Tables']['marrai_agent_solutions']['Row'];

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #4f46e5',
    paddingBottom: 15,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    borderBottom: '1 solid #e2e8f0',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 120,
    fontWeight: 'bold',
    color: '#475569',
  },
  value: {
    flex: 1,
    color: '#1e293b',
  },
  text: {
    color: '#334155',
    lineHeight: 1.5,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 10,
  },
  statBox: {
    backgroundColor: '#f1f5f9',
    padding: 15,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  list: {
    marginTop: 5,
    marginLeft: 20,
  },
  listItem: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 5,
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
  },
});

const CATEGORY_LABELS: Record<string, string> = {
  health: 'Santé',
  education: 'Éducation',
  agriculture: 'Agriculture',
  tech: 'Technologie',
  infrastructure: 'Infrastructures',
  administration: 'Administration',
  logistics: 'Logistique',
  finance: 'Finance',
  customer_service: 'Service client',
  inclusion: 'Inclusion',
  other: 'Autre',
};

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Soumis',
  analyzing: 'Analyse en cours',
  analyzed: 'Analysé',
  matched: 'Apparié',
  funded: 'Financé',
  in_progress: 'En cours',
  completed: 'Terminé',
  rejected: 'Rejeté',
};

// PDF Document Component
export const IdeaPDFDocument = ({
  idea,
  agentSolution,
  baseUrl,
}: {
  idea: IdeaRow;
  agentSolution: AgentSolutionRow | null;
  baseUrl: string;
}) => {
  const categoryLabel = idea.category ? CATEGORY_LABELS[idea.category] || idea.category : 'Autre';
  const statusLabel = idea.status ? STATUS_LABELS[idea.status] || idea.status : 'Inconnu';
  const aiAnalysis = idea.ai_analysis as Record<string, unknown> | null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Fikra Labs Idea Bank</Text>
          <Text style={styles.subtitle}>Rapport d'analyse d'idée</Text>
        </View>

        {/* Idea Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de l'Idée</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Titre:</Text>
            <Text style={styles.value}>{idea.title}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Catégorie:</Text>
            <Text style={styles.value}>{categoryLabel}</Text>
          </View>
          {idea.location && (
            <View style={styles.row}>
              <Text style={styles.label}>Localisation:</Text>
              <Text style={styles.value}>{idea.location}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Statut:</Text>
            <Text style={styles.value}>{statusLabel}</Text>
          </View>
          {idea.created_at && (
            <View style={styles.row}>
              <Text style={styles.label}>Date de soumission:</Text>
              <Text style={styles.value}>{formatDate(idea.created_at)}</Text>
            </View>
          )}
        </View>

        {/* Problem Statement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Problème Identifié</Text>
          <Text style={styles.text}>{idea.problem_statement}</Text>
          {idea.current_manual_process && (
            <>
              <Text style={[styles.text, { marginTop: 10, fontWeight: 'bold' }]}>Processus manuel actuel:</Text>
              <Text style={styles.text}>{idea.current_manual_process}</Text>
            </>
          )}
        </View>

        {/* Digitization Opportunity */}
        {idea.digitization_opportunity && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opportunité de Numérisation</Text>
            <Text style={styles.text}>{idea.digitization_opportunity}</Text>
          </View>
        )}

        {/* AI Analysis */}
        {aiAnalysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analyse IA - Résumé</Text>
            <View style={styles.statsContainer}>
              {typeof idea.ai_feasibility_score === 'number' && (
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Faisabilité</Text>
                  <Text style={styles.statValue}>{idea.ai_feasibility_score.toFixed(1)}/10</Text>
                </View>
              )}
              {typeof idea.ai_impact_score === 'number' && (
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Impact</Text>
                  <Text style={styles.statValue}>{idea.ai_impact_score.toFixed(1)}/10</Text>
                </View>
              )}
            </View>
            {aiAnalysis.strengths && Array.isArray(aiAnalysis.strengths) && (
              <>
                <Text style={[styles.text, { fontWeight: 'bold', marginTop: 10 }]}>Points forts:</Text>
                <View style={styles.list}>
                  {aiAnalysis.strengths.map((strength: string, i: number) => (
                    <Text key={i} style={styles.listItem}>
                      • {strength}
                    </Text>
                  ))}
                </View>
              </>
            )}
            {aiAnalysis.challenges && Array.isArray(aiAnalysis.challenges) && (
              <>
                <Text style={[styles.text, { fontWeight: 'bold', marginTop: 10 }]}>Défis:</Text>
                <View style={styles.list}>
                  {aiAnalysis.challenges.map((challenge: string, i: number) => (
                    <Text key={i} style={styles.listItem}>
                      • {challenge}
                    </Text>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* Agent Solution */}
        {agentSolution && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Architecture de l'Agent IA</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Nom de l'agent:</Text>
              <Text style={styles.value}>{agentSolution.agent_name}</Text>
            </View>
            {agentSolution.agent_type && (
              <View style={styles.row}>
                <Text style={styles.label}>Type d'agent:</Text>
                <Text style={styles.value}>{agentSolution.agent_type}</Text>
              </View>
            )}
            {agentSolution.architecture && (
              <>
                <Text style={[styles.text, { fontWeight: 'bold', marginTop: 10 }]}>Architecture:</Text>
                <Text style={styles.text}>
                  {typeof agentSolution.architecture === 'string'
                    ? agentSolution.architecture
                    : JSON.stringify(agentSolution.architecture, null, 2)}
                </Text>
              </>
            )}
          </View>
        )}

        {/* ROI Analysis */}
        {(idea.roi_time_saved_hours || idea.roi_cost_saved_eur) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analyse ROI</Text>
            <View style={styles.statsContainer}>
              {idea.roi_time_saved_hours && (
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Temps économisé</Text>
                  <Text style={styles.statValue}>{idea.roi_time_saved_hours}h/mois</Text>
                </View>
              )}
              {idea.roi_cost_saved_eur && (
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Coût économisé</Text>
                  <Text style={styles.statValue}>{formatCurrency(idea.roi_cost_saved_eur)}/mois</Text>
                </View>
              )}
            </View>
            {aiAnalysis && 'roi_analysis' in aiAnalysis && aiAnalysis.roi_analysis && (
              <Text style={[styles.text, { marginTop: 10 }]}>
                {typeof aiAnalysis.roi_analysis === 'string'
                  ? aiAnalysis.roi_analysis
                  : JSON.stringify(aiAnalysis.roi_analysis, null, 2)}
              </Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Généré le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} •{' '}
            {baseUrl}/ideas/{idea.id}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

