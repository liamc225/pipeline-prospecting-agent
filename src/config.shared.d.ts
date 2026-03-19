export const MODEL: string;
export const PRODUCT_PROFILE: {
  readonly name: string;
  readonly category: string;
  readonly description: string;
};
export const ICP_CRITERIA: {
  readonly segments: readonly string[];
  readonly priority_crm_platforms: readonly string[];
  readonly min_employees_strong_fit: number;
};
export const VALUE_PROPOSITIONS: Record<
  string,
  {
    readonly name: string;
    readonly description: string;
    readonly strongest_segments: readonly string[];
  }
>;
export const SYSTEM_PROMPT: string;
