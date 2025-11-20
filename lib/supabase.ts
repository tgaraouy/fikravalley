import { createClient } from '@supabase/supabase-js';

// Database types for all marrai_ tables
// Types match the actual database schema from marrai_schema.sql
export interface Database {
  public: {
    Tables: {
      marrai_ideas: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          title: string;
          problem_statement: string;
          proposed_solution: string | null;
          category: 'health' | 'education' | 'agriculture' | 'tech' | 'infrastructure' | 'administration' | 'logistics' | 'finance' | 'customer_service' | 'inclusion' | 'other' | null;
          location: 'casablanca' | 'rabat' | 'marrakech' | 'kenitra' | 'tangier' | 'agadir' | 'fes' | 'meknes' | 'oujda' | 'other' | null;
          current_manual_process: string | null;
          digitization_opportunity: string | null;
          frequency: 'multiple_daily' | 'daily' | 'weekly' | 'monthly' | 'occasional' | null;
          data_sources: string[] | null;
          integration_points: string[] | null;
          ai_capabilities_needed: string[] | null;
          automation_potential: 'high' | 'medium' | 'low' | null;
          agent_type: 'workflow_agent' | 'data_agent' | 'decision_agent' | 'interface_agent' | 'hybrid_agent' | null;
          human_in_loop: boolean | null;
          estimated_cost: '<1K' | '1K-3K' | '3K-5K' | '5K-10K' | '10K+' | 'unknown' | null;
          roi_time_saved_hours: number | null;
          roi_cost_saved_eur: number | null;
          submitter_name: string | null;
          submitter_email: string | null;
          submitter_phone: string | null;
          submitter_type: 'student' | 'professional' | 'diaspora' | 'entrepreneur' | 'government' | 'researcher' | 'other' | null;
          submitter_skills: string[] | null;
          ai_feasibility_score: number | null;
          ai_analysis: Record<string, unknown> | null;
          ai_category_suggested: string | null;
          ai_cost_estimate: string | null;
          ai_impact_score: number | null;
          analysis_completed_at: string | null;
          matched_diaspora: string[] | null;
          matching_score: number | null;
          matched_at: string | null;
          status: 'submitted' | 'analyzing' | 'analyzed' | 'matched' | 'funded' | 'in_progress' | 'completed' | 'rejected' | null;
          featured: boolean | null;
          priority: 'critical' | 'high' | 'medium' | 'low' | null;
          workshop_session: string | null;
          submitted_via: 'web' | 'whatsapp' | 'workshop_form' | 'workshop_conversation' | null;
          admin_notes: string | null;
          rejected_reason: string | null;
          intilaka_pdf_generated: boolean | null;
          intilaka_pdf_url: string | null;
          intilaka_pdf_generated_at: string | null;
          alignment: Record<string, any> | null;
          last_contacted_at: string | null;
          contact_method: 'email' | 'phone' | 'whatsapp' | 'other' | null;
          follow_up_status: 'pending' | 'contacted' | 'completed' | 'escalated' | null;
          contact_attempts: number | null;
          next_follow_up_date: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          title: string;
          problem_statement: string;
          proposed_solution?: string | null;
          category?: 'health' | 'education' | 'agriculture' | 'tech' | 'infrastructure' | 'administration' | 'logistics' | 'finance' | 'customer_service' | 'inclusion' | 'other' | null;
          location?: 'casablanca' | 'rabat' | 'marrakech' | 'kenitra' | 'tangier' | 'agadir' | 'fes' | 'meknes' | 'oujda' | 'other' | null;
          current_manual_process?: string | null;
          digitization_opportunity?: string | null;
          frequency?: 'multiple_daily' | 'daily' | 'weekly' | 'monthly' | 'occasional' | null;
          data_sources?: string[] | null;
          integration_points?: string[] | null;
          ai_capabilities_needed?: string[] | null;
          automation_potential?: 'high' | 'medium' | 'low' | null;
          agent_type?: 'workflow_agent' | 'data_agent' | 'decision_agent' | 'interface_agent' | 'hybrid_agent' | null;
          human_in_loop?: boolean | null;
          estimated_cost?: '<1K' | '1K-3K' | '3K-5K' | '5K-10K' | '10K+' | 'unknown' | null;
          roi_time_saved_hours?: number | null;
          roi_cost_saved_eur?: number | null;
          submitter_name?: string | null;
          submitter_email?: string | null;
          submitter_phone?: string | null;
          submitter_type?: 'student' | 'professional' | 'diaspora' | 'entrepreneur' | 'government' | 'researcher' | 'other' | null;
          submitter_skills?: string[] | null;
          ai_feasibility_score?: number | null;
          ai_analysis?: Record<string, unknown> | null;
          ai_category_suggested?: string | null;
          ai_cost_estimate?: string | null;
          ai_impact_score?: number | null;
          analysis_completed_at?: string | null;
          matched_diaspora?: string[] | null;
          matching_score?: number | null;
          matched_at?: string | null;
          status?: 'submitted' | 'analyzing' | 'analyzed' | 'matched' | 'funded' | 'in_progress' | 'completed' | 'rejected' | null;
          featured?: boolean | null;
          priority?: 'critical' | 'high' | 'medium' | 'low' | null;
          workshop_session?: string | null;
          submitted_via?: 'web' | 'whatsapp' | 'workshop_form' | 'workshop_conversation' | null;
          admin_notes?: string | null;
          rejected_reason?: string | null;
          intilaka_pdf_generated?: boolean | null;
          intilaka_pdf_url?: string | null;
          intilaka_pdf_generated_at?: string | null;
          last_contacted_at?: string | null;
          contact_method?: 'email' | 'phone' | 'whatsapp' | 'other' | null;
          follow_up_status?: 'pending' | 'contacted' | 'completed' | 'escalated' | null;
          contact_attempts?: number | null;
          next_follow_up_date?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          title?: string;
          problem_statement?: string;
          proposed_solution?: string | null;
          category?: 'health' | 'education' | 'agriculture' | 'tech' | 'infrastructure' | 'administration' | 'logistics' | 'finance' | 'customer_service' | 'inclusion' | 'other' | null;
          location?: 'casablanca' | 'rabat' | 'marrakech' | 'kenitra' | 'tangier' | 'agadir' | 'fes' | 'meknes' | 'oujda' | 'other' | null;
          current_manual_process?: string | null;
          digitization_opportunity?: string | null;
          frequency?: 'multiple_daily' | 'daily' | 'weekly' | 'monthly' | 'occasional' | null;
          data_sources?: string[] | null;
          integration_points?: string[] | null;
          ai_capabilities_needed?: string[] | null;
          automation_potential?: 'high' | 'medium' | 'low' | null;
          agent_type?: 'workflow_agent' | 'data_agent' | 'decision_agent' | 'interface_agent' | 'hybrid_agent' | null;
          human_in_loop?: boolean | null;
          estimated_cost?: '<1K' | '1K-3K' | '3K-5K' | '5K-10K' | '10K+' | 'unknown' | null;
          roi_time_saved_hours?: number | null;
          roi_cost_saved_eur?: number | null;
          submitter_name?: string | null;
          submitter_email?: string | null;
          submitter_phone?: string | null;
          submitter_type?: 'student' | 'professional' | 'diaspora' | 'entrepreneur' | 'government' | 'researcher' | 'other' | null;
          submitter_skills?: string[] | null;
          ai_feasibility_score?: number | null;
          ai_analysis?: Record<string, unknown> | null;
          ai_category_suggested?: string | null;
          ai_cost_estimate?: string | null;
          ai_impact_score?: number | null;
          analysis_completed_at?: string | null;
          matched_diaspora?: string[] | null;
          matching_score?: number | null;
          matched_at?: string | null;
          status?: 'submitted' | 'analyzing' | 'analyzed' | 'matched' | 'funded' | 'in_progress' | 'completed' | 'rejected' | null;
          featured?: boolean | null;
          priority?: 'critical' | 'high' | 'medium' | 'low' | null;
          workshop_session?: string | null;
          submitted_via?: 'web' | 'whatsapp' | 'workshop_form' | 'workshop_conversation' | null;
          admin_notes?: string | null;
          rejected_reason?: string | null;
          intilaka_pdf_generated?: boolean | null;
          intilaka_pdf_url?: string | null;
          intilaka_pdf_generated_at?: string | null;
          last_contacted_at?: string | null;
          contact_method?: 'email' | 'phone' | 'whatsapp' | 'other' | null;
          follow_up_status?: 'pending' | 'contacted' | 'completed' | 'escalated' | null;
          contact_attempts?: number | null;
          next_follow_up_date?: string | null;
        };
      };
      marrai_workshop_sessions: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          name_french: string | null;
          date: string | null;
          start_time: string | null;
          end_time: string | null;
          room: string | null;
          moderator: string | null;
          expected_attendees: number | null;
          actual_attendees: number | null;
          key_speakers: string[] | null;
          recording_started: boolean | null;
          recording_stopped: boolean | null;
          recording_url: string | null;
          recording_duration_minutes: number | null;
          transcript_word_count: number | null;
          transcript_language_breakdown: Record<string, unknown> | null;
          ideas_detected: number | null;
          ideas_validated: number | null;
          ideas_rejected: number | null;
          ideas_pending: number | null;
          session_summary: string | null;
          key_topics: string[] | null;
          notable_moments: string[] | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          name: string;
          name_french?: string | null;
          date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          room?: string | null;
          moderator?: string | null;
          expected_attendees?: number | null;
          actual_attendees?: number | null;
          key_speakers?: string[] | null;
          recording_started?: boolean | null;
          recording_stopped?: boolean | null;
          recording_url?: string | null;
          recording_duration_minutes?: number | null;
          transcript_word_count?: number | null;
          transcript_language_breakdown?: Record<string, unknown> | null;
          ideas_detected?: number | null;
          ideas_validated?: number | null;
          ideas_rejected?: number | null;
          ideas_pending?: number | null;
          session_summary?: string | null;
          key_topics?: string[] | null;
          notable_moments?: string[] | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          name_french?: string | null;
          date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          room?: string | null;
          moderator?: string | null;
          expected_attendees?: number | null;
          actual_attendees?: number | null;
          key_speakers?: string[] | null;
          recording_started?: boolean | null;
          recording_stopped?: boolean | null;
          recording_url?: string | null;
          recording_duration_minutes?: number | null;
          transcript_word_count?: number | null;
          transcript_language_breakdown?: Record<string, unknown> | null;
          ideas_detected?: number | null;
          ideas_validated?: number | null;
          ideas_rejected?: number | null;
          ideas_pending?: number | null;
          session_summary?: string | null;
          key_topics?: string[] | null;
          notable_moments?: string[] | null;
        };
      };
      marrai_conversation_ideas: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          session_id: string | null;
          transcript_ids: string[] | null;
          mentioned_at_timestamp: string | null;
          speaker_quote: string;
          speaker_context: string | null;
          speaker_email: string | null;
          problem_title: string;
          problem_statement: string;
          current_manual_process: string | null;
          proposed_solution: string | null;
          category: string | null;
          digitization_opportunity: string | null;
          confidence_score: number | null;
          extraction_reasoning: string | null;
          needs_clarification: boolean | null;
          validation_question: string | null;
          status: 'pending_validation' | 'speaker_contacted' | 'speaker_validated' | 'speaker_rejected' | 'needs_refinement' | 'promoted_to_idea' | null;
          validated_by: string | null;
          validated_at: string | null;
          validation_method: string | null;
          validation_notes: string | null;
          refinement_notes: string | null;
          promoted_to_idea_id: string | null;
          promoted_at: string | null;
          flagged_for_review: boolean | null;
          admin_notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          session_id?: string | null;
          transcript_ids?: string[] | null;
          mentioned_at_timestamp?: string | null;
          speaker_quote: string;
          speaker_context?: string | null;
          speaker_email?: string | null;
          problem_title: string;
          problem_statement: string;
          current_manual_process?: string | null;
          proposed_solution?: string | null;
          category?: string | null;
          digitization_opportunity?: string | null;
          confidence_score?: number | null;
          extraction_reasoning?: string | null;
          needs_clarification?: boolean | null;
          validation_question?: string | null;
          status?: 'pending_validation' | 'speaker_contacted' | 'speaker_validated' | 'speaker_rejected' | 'needs_refinement' | 'promoted_to_idea' | null;
          validated_by?: string | null;
          validated_at?: string | null;
          validation_method?: string | null;
          validation_notes?: string | null;
          refinement_notes?: string | null;
          promoted_to_idea_id?: string | null;
          promoted_at?: string | null;
          flagged_for_review?: boolean | null;
          admin_notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          session_id?: string | null;
          transcript_ids?: string[] | null;
          mentioned_at_timestamp?: string | null;
          speaker_quote?: string;
          speaker_context?: string | null;
          speaker_email?: string | null;
          problem_title?: string;
          problem_statement?: string;
          current_manual_process?: string | null;
          proposed_solution?: string | null;
          category?: string | null;
          digitization_opportunity?: string | null;
          confidence_score?: number | null;
          extraction_reasoning?: string | null;
          needs_clarification?: boolean | null;
          validation_question?: string | null;
          status?: 'pending_validation' | 'speaker_contacted' | 'speaker_validated' | 'speaker_rejected' | 'needs_refinement' | 'promoted_to_idea' | null;
          validated_by?: string | null;
          validated_at?: string | null;
          validation_method?: string | null;
          validation_notes?: string | null;
          refinement_notes?: string | null;
          promoted_to_idea_id?: string | null;
          promoted_at?: string | null;
          flagged_for_review?: boolean | null;
          admin_notes?: string | null;
        };
      };
      marrai_diaspora_profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          name: string;
          email: string | null;
          phone: string | null;
          location: string | null;
          moroccan_city: string | null;
          expertise: string[] | null;
          skills: string[] | null;
          years_experience: number | null;
          currentrole: string[] | null;
          company: string | null;
          willing_to_mentor: boolean | null;
          willing_to_cofund: boolean | null;
          max_cofund_amount: string | null;
          available_hours_per_month: number | null;
          attended_kenitra: boolean | null;
          mgl_member: boolean | null;
          chapter: string | null;
          ideas_matched: number | null;
          ideas_funded: number | null;
          total_cofunded_eur: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          name: string;
          email?: string | null;
          phone?: string | null;
          location?: string | null;
          moroccan_city?: string | null;
          expertise?: string[] | null;
          skills?: string[] | null;
          years_experience?: number | null;
          currentrole?: string[] | null;
          company?: string | null;
          willing_to_mentor?: boolean | null;
          willing_to_cofund?: boolean | null;
          max_cofund_amount?: string | null;
          available_hours_per_month?: number | null;
          attended_kenitra?: boolean | null;
          mgl_member?: boolean | null;
          chapter?: string | null;
          ideas_matched?: number | null;
          ideas_funded?: number | null;
          total_cofunded_eur?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          name?: string;
          email?: string | null;
          phone?: string | null;
          location?: string | null;
          moroccan_city?: string | null;
          expertise?: string[] | null;
          skills?: string[] | null;
          years_experience?: number | null;
          currentrole?: string[] | null;
          company?: string | null;
          willing_to_mentor?: boolean | null;
          willing_to_cofund?: boolean | null;
          max_cofund_amount?: string | null;
          available_hours_per_month?: number | null;
          attended_kenitra?: boolean | null;
          mgl_member?: boolean | null;
          chapter?: string | null;
          ideas_matched?: number | null;
          ideas_funded?: number | null;
          total_cofunded_eur?: number | null;
        };
      };
      marrai_agent_solutions: {
        Row: {
          id: string;
          created_at: string;
          idea_id: string | null;
          agent_name: string;
          agent_description: string | null;
          agent_type: 'workflow' | 'data' | 'decision' | 'interface' | 'hybrid' | null;
          triggers: string[] | null;
          actions: string[] | null;
          tools_needed: string[] | null;
          architecture_diagram_url: string | null;
          pseudocode: string | null;
          sample_prompt: string | null;
          workflow_description: string | null;
          complexity: 'simple' | 'moderate' | 'complex' | null;
          estimated_dev_time: string | null;
          estimated_cost: string | null;
          tech_stack: Record<string, unknown> | null;
          monthly_operating_cost: string | null;
          phase_1_mvp: string | null;
          phase_2_automation: string | null;
          phase_3_full_agent: string | null;
          automation_percentage: number | null;
          monthly_time_saved: number | null;
          monthly_cost_saved: number | null;
          payback_period: string | null;
          annual_roi_percentage: number | null;
          replicability: 'high' | 'medium' | 'low' | null;
          market_size: string | null;
          potential_revenue: string | null;
          code_samples: Record<string, unknown> | null;
          api_specs: Record<string, unknown> | null;
          deployment_guide: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          idea_id?: string | null;
          agent_name: string;
          agent_description?: string | null;
          agent_type?: 'workflow' | 'data' | 'decision' | 'interface' | 'hybrid' | null;
          triggers?: string[] | null;
          actions?: string[] | null;
          tools_needed?: string[] | null;
          architecture_diagram_url?: string | null;
          pseudocode?: string | null;
          sample_prompt?: string | null;
          workflow_description?: string | null;
          complexity?: 'simple' | 'moderate' | 'complex' | null;
          estimated_dev_time?: string | null;
          estimated_cost?: string | null;
          tech_stack?: Record<string, unknown> | null;
          monthly_operating_cost?: string | null;
          phase_1_mvp?: string | null;
          phase_2_automation?: string | null;
          phase_3_full_agent?: string | null;
          automation_percentage?: number | null;
          monthly_time_saved?: number | null;
          monthly_cost_saved?: number | null;
          payback_period?: string | null;
          annual_roi_percentage?: number | null;
          replicability?: 'high' | 'medium' | 'low' | null;
          market_size?: string | null;
          potential_revenue?: string | null;
          code_samples?: Record<string, unknown> | null;
          api_specs?: Record<string, unknown> | null;
          deployment_guide?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          idea_id?: string | null;
          agent_name?: string;
          agent_description?: string | null;
          agent_type?: 'workflow' | 'data' | 'decision' | 'interface' | 'hybrid' | null;
          triggers?: string[] | null;
          actions?: string[] | null;
          tools_needed?: string[] | null;
          architecture_diagram_url?: string | null;
          pseudocode?: string | null;
          sample_prompt?: string | null;
          workflow_description?: string | null;
          complexity?: 'simple' | 'moderate' | 'complex' | null;
          estimated_dev_time?: string | null;
          estimated_cost?: string | null;
          tech_stack?: Record<string, unknown> | null;
          monthly_operating_cost?: string | null;
          phase_1_mvp?: string | null;
          phase_2_automation?: string | null;
          phase_3_full_agent?: string | null;
          automation_percentage?: number | null;
          monthly_time_saved?: number | null;
          monthly_cost_saved?: number | null;
          payback_period?: string | null;
          annual_roi_percentage?: number | null;
          replicability?: 'high' | 'medium' | 'low' | null;
          market_size?: string | null;
          potential_revenue?: string | null;
          code_samples?: Record<string, unknown> | null;
          api_specs?: Record<string, unknown> | null;
          deployment_guide?: string | null;
        };
      };
      marrai_transcripts: {
        Row: {
          id: string;
          created_at: string;
          session_id: string | null;
          text: string;
          text_cleaned: string | null;
          word_count: number | null;
          timestamp_in_session: string | null;
          duration_seconds: number | null;
          language: string | null;
          language_confidence: number | null;
          speaker_identified: string | null;
          speaker_confidence: number | null;
          processed: boolean | null;
          contains_idea: boolean | null;
          analysis_attempted: boolean | null;
          audio_chunk_url: string | null;
          transcription_service: string | null;
          transcription_confidence: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          session_id?: string | null;
          text: string;
          text_cleaned?: string | null;
          word_count?: number | null;
          timestamp_in_session?: string | null;
          duration_seconds?: number | null;
          language?: string | null;
          language_confidence?: number | null;
          speaker_identified?: string | null;
          speaker_confidence?: number | null;
          processed?: boolean | null;
          contains_idea?: boolean | null;
          analysis_attempted?: boolean | null;
          audio_chunk_url?: string | null;
          transcription_service?: string | null;
          transcription_confidence?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          session_id?: string | null;
          text?: string;
          text_cleaned?: string | null;
          word_count?: number | null;
          timestamp_in_session?: string | null;
          duration_seconds?: number | null;
          language?: string | null;
          language_confidence?: number | null;
          speaker_identified?: string | null;
          speaker_confidence?: number | null;
          processed?: boolean | null;
          contains_idea?: boolean | null;
          analysis_attempted?: boolean | null;
          audio_chunk_url?: string | null;
          transcription_service?: string | null;
          transcription_confidence?: number | null;
        };
      };
      marrai_idea_comments: {
        Row: {
          id: string;
          created_at: string;
          idea_id: string;
          author_name: string;
          author_email: string | null;
          comment_text: string;
          comment_type: 'suggestion' | 'question' | 'concern' | 'support' | 'technical';
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          idea_id: string;
          author_name: string;
          author_email?: string | null;
          comment_text: string;
          comment_type: 'suggestion' | 'question' | 'concern' | 'support' | 'technical';
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          idea_id?: string;
          author_name?: string;
          author_email?: string | null;
          comment_text?: string;
          comment_type?: 'suggestion' | 'question' | 'concern' | 'support' | 'technical';
          updated_at?: string | null;
        };
      };
      marrai_self_ask_questions: {
        Row: {
          id: string;
          idea_id: string;
          question_id: string;
          question_order: number;
          question_text: string;
          status: 'asked' | 'answered' | 'skipped';
          asked_at: string;
          answered_at: string | null;
        };
        Insert: {
          id: string;
          idea_id: string;
          question_id: string;
          question_order: number;
          question_text: string;
          status: 'asked' | 'answered' | 'skipped';
          asked_at: string;
          answered_at?: string | null;
        };
        Update: {
          id?: string;
          idea_id?: string;
          question_id?: string;
          question_order?: number;
          question_text?: string;
          status?: 'asked' | 'answered' | 'skipped';
          asked_at?: string;
          answered_at?: string | null;
        };
      };
      marrai_self_ask_responses: {
        Row: {
          id: string;
          idea_id: string;
          question_id: string;
          original_text: string;
          extracted_data: Record<string, any>;
          entities: Record<string, any>;
          sentiment: 'positive' | 'neutral' | 'negative';
          confidence: number;
          created_at: string;
        };
        Insert: {
          id: string;
          idea_id: string;
          question_id: string;
          original_text: string;
          extracted_data: Record<string, any>;
          entities: Record<string, any>;
          sentiment: 'positive' | 'neutral' | 'negative';
          confidence: number;
          created_at: string;
        };
        Update: {
          id?: string;
          idea_id?: string;
          question_id?: string;
          original_text?: string;
          extracted_data?: Record<string, any>;
          entities?: Record<string, any>;
          sentiment?: 'positive' | 'neutral' | 'negative';
          confidence?: number;
          created_at?: string;
        };
      };
      marrai_access_requests: {
        Row: {
          id: string;
          email: string;
          name: string;
          organization: string | null;
          user_type:
          | 'workshop_attendee'
          | 'student'
          | 'professional'
          | 'diaspora'
          | 'government'
          | 'entrepreneur'
          | 'other';
          reason: string;
          how_heard: string | null;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          rejection_reason: string | null;
          activation_token: string | null;
          activation_expires_at: string | null;
          activated_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          organization?: string | null;
          user_type:
          | 'workshop_attendee'
          | 'student'
          | 'professional'
          | 'diaspora'
          | 'government'
          | 'entrepreneur'
          | 'other';
          reason: string;
          how_heard?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rejection_reason?: string | null;
          activation_token?: string | null;
          activation_expires_at?: string | null;
          activated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          organization?: string | null;
          user_type?:
          | 'workshop_attendee'
          | 'student'
          | 'professional'
          | 'diaspora'
          | 'government'
          | 'entrepreneur'
          | 'other';
          reason?: string;
          how_heard?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rejection_reason?: string | null;
          activation_token?: string | null;
          activation_expires_at?: string | null;
          activated_at?: string | null;
        };
        Relationships: [];
      };
      privacy_incidents: {
        Row: {
          id: string;
          title: string;
          description: string;
          severity: string | null;
          status: string | null;
          affected_users: string[] | null;
          discovered_at: string | null;
          notification_deadline: string | null;
          created_at: string | null;
          created_by: string | null;
          updated_at: string | null;
          updated_by: string | null;
          remediation_steps: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          severity?: string | null;
          status?: string | null;
          affected_users?: string[] | null;
          discovered_at?: string | null;
          notification_deadline?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          remediation_steps?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          severity?: string | null;
          status?: string | null;
          affected_users?: string[] | null;
          discovered_at?: string | null;
          notification_deadline?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          remediation_steps?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      admin_access_logs: {
        Row: {
          id: string;
          admin_id: string;
          user_id: string | null;
          action: string;
          reason: string;
          ip_address: string | null;
          user_agent: string | null;
          timestamp: string;
          metadata: Record<string, unknown> | null;
        };
        Insert: {
          id?: string;
          admin_id: string;
          user_id?: string | null;
          action: string;
          reason: string;
          ip_address?: string | null;
          user_agent?: string | null;
          timestamp?: string;
          metadata?: Record<string, unknown> | null;
        };
        Update: {
          id?: string;
          admin_id?: string;
          user_id?: string | null;
          action?: string;
          reason?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          timestamp?: string;
          metadata?: Record<string, unknown> | null;
        };
        Relationships: [];
      };
      marrai_secure_users: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          phone_hash: string;
          encrypted_name: string;
          name_iv: string;
          name_tag: string;
          anonymous_email: string;
          consent: boolean;
          consent_date: string;
          data_retention_expiry: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          phone_hash: string;
          encrypted_name: string;
          name_iv: string;
          name_tag: string;
          anonymous_email: string;
          consent?: boolean;
          consent_date?: string;
          data_retention_expiry: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          phone_hash?: string;
          encrypted_name?: string;
          name_iv?: string;
          name_tag?: string;
          anonymous_email?: string;
          consent?: boolean;
          consent_date?: string;
          data_retention_expiry?: string;
        };
        Relationships: [];
      };
      marrai_consents: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          phone_hash: string;
          consent_type: 'submission' | 'marketing' | 'analysis' | 'data_retention';
          granted: boolean;
          consent_version: string;
          consent_method: 'whatsapp' | 'web' | 'email' | 'phone' | 'in_person' | 'other';
          ip_address: string | null;
          user_agent: string | null;
          expires_at: string | null;
          metadata: Record<string, unknown> | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          phone_hash: string;
          consent_type: 'submission' | 'marketing' | 'analysis' | 'data_retention';
          granted: boolean;
          consent_version?: string;
          consent_method: 'whatsapp' | 'web' | 'email' | 'phone' | 'in_person' | 'other';
          ip_address?: string | null;
          user_agent?: string | null;
          expires_at?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          phone_hash?: string;
          consent_type?: 'submission' | 'marketing' | 'analysis' | 'data_retention';
          granted?: boolean;
          consent_version?: string;
          consent_method?: 'whatsapp' | 'web' | 'email' | 'phone' | 'in_person' | 'other';
          ip_address?: string | null;
          user_agent?: string | null;
          expires_at?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Relationships: [];
      };
      marrai_deletion_requests: {
        Row: {
          id: string;
          user_id: string;
          verification_code: string;
          status: 'pending' | 'cancelled' | 'confirmed' | 'completed';
          requested_at: string;
          scheduled_deletion_date: string;
          ip_address: string | null;
          user_agent: string | null;
          cancelled_at: string | null;
          confirmed_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          verification_code: string;
          status?: 'pending' | 'cancelled' | 'confirmed' | 'completed';
          requested_at?: string;
          scheduled_deletion_date: string;
          ip_address?: string | null;
          user_agent?: string | null;
          cancelled_at?: string | null;
          confirmed_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          verification_code?: string;
          status?: 'pending' | 'cancelled' | 'confirmed' | 'completed';
          requested_at?: string;
          scheduled_deletion_date?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          cancelled_at?: string | null;
          confirmed_at?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      marrai_export_requests: {
        Row: {
          id: string;
          user_id: string;
          otp: string | null;
          status: 'pending' | 'completed' | 'cancelled';
          format: 'json' | 'pdf';
          created_at: string;
          ip_address: string | null;
          user_agent: string | null;
          download_count: number | null;
          completed_at: string | null;
          download_url: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          otp?: string | null;
          status?: 'pending' | 'completed' | 'cancelled';
          format?: 'json' | 'pdf';
          created_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          download_count?: number | null;
          completed_at?: string | null;
          download_url?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          otp?: string | null;
          status?: 'pending' | 'completed' | 'cancelled';
          format?: 'json' | 'pdf';
          created_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          download_count?: number | null;
          completed_at?: string | null;
          download_url?: string | null;
        };
        Relationships: [];
      };
      marrai_audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          actor: string;
          timestamp: string;
          metadata: Record<string, unknown> | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          actor: string;
          timestamp?: string;
          metadata?: Record<string, unknown> | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          actor?: string;
          timestamp?: string;
          metadata?: Record<string, unknown> | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client with placeholder values if env vars are missing (for graceful degradation)
// This allows the app to load even if env vars aren't set, but queries will fail
const safeUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeKey = supabaseAnonKey || 'placeholder-key';

// Create client with Database types, but allow any table access
export const supabase = createClient<Database>(safeUrl, safeKey) as any;

// Export a function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

