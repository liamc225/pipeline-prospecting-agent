// Types mirroring the Zod schemas in ../src/schemas.ts
// Kept in sync manually — these are the shapes the trigger.dev task expects/returns.

export interface Account {
  id: number;
  company: string;
  industry: string;
  us_employees: number;
  contact_name: string | null;
  contact_title: string | null;
  crm_platform: string;
  notes: string;
}

export type ValueProp =
  | "pipeline_visibility"
  | "workflow_automation"
  | "seller_productivity"
  | "governance_and_handoff";

export interface ValuePropMatch {
  value_prop: ValueProp;
  relevance_score: number;
  reasoning: string;
}

export interface DiscoveryQuestion {
  question: string;
  rationale: string;
}

export type EmailFramework =
  | "pain_led"
  | "insight_led";

export type IcpFit = "strong_fit" | "moderate_fit" | "weak_fit" | "disqualify";

export interface ProspectingOutput {
  account_id: number;
  company: string;
  icp_fit: IcpFit;
  icp_reasoning: string;
  matched_value_props: ValuePropMatch[];
  email_framework: EmailFramework;
  email_subject: string;
  email_body: string;
  discovery_questions: DiscoveryQuestion[];
  confidence_score: number;
  flags: string[];
  sparse_data_handling?: string | null;
  market_intelligence?: string | null;
}

export interface QualityResult {
  checks: Record<string, boolean>;
  quality_score: number;
}

// The shape returned by the prospect-account trigger.dev task
export interface ProspectAccountResult {
  result: ProspectingOutput;
  quality: QualityResult;
}
