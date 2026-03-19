import test from "node:test";
import assert from "node:assert/strict";
import {
  applyPostProcessingGates,
  evaluateOutput,
} from "../src/prospecting.js";
import type { Account, ProspectingOutput } from "../src/schemas.js";

function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: 1,
    company: "Northstar Field Services",
    industry: "Facilities services",
    us_employees: 4800,
    contact_name: "Alicia Gomez",
    contact_title: "VP, Revenue Operations",
    crm_platform: "Salesforce",
    notes: "Multi-region field team",
    ...overrides,
  };
}

function makeOutput(
  overrides: Partial<ProspectingOutput> = {}
): ProspectingOutput {
  return {
    account_id: 999,
    company: "Northstar Field Services",
    icp_fit: "strong_fit",
    icp_reasoning: "Good fit",
    matched_value_props: [
      {
        value_prop: "pipeline_visibility",
        relevance_score: 0.9,
        reasoning: "Relevant",
      },
    ],
    email_framework: "pain_led",
    email_subject: "Subject",
    email_body: "Short email body for testing",
    discovery_questions: [
      { question: "Q1", rationale: "R1" },
      { question: "Q2", rationale: "R2" },
    ],
    confidence_score: 0.8,
    flags: [],
    sparse_data_handling: null,
    market_intelligence: null,
    ...overrides,
  };
}

test("applyPostProcessingGates resets account_id and flags missing contact", () => {
  const account = makeAccount({ id: 42, contact_name: null, contact_title: null });
  const output = makeOutput();

  const result = applyPostProcessingGates(account, output);

  assert.equal(result.account_id, 42);
  assert.ok(result.flags.some((flag) => flag.toLowerCase().includes("no contact")));
});

test("applyPostProcessingGates suppresses weak-fit emails", () => {
  const result = applyPostProcessingGates(
    makeAccount(),
    makeOutput({
      icp_fit: "weak_fit",
      email_subject: "Keep me",
      email_body: "Keep me",
    })
  );

  assert.equal(result.email_subject, "");
  assert.equal(result.email_body, "");
  assert.ok(result.flags.some((flag) => flag.toLowerCase().includes("weak")));
});

test("evaluateOutput returns full score for valid output", () => {
  const result = evaluateOutput(makeOutput());
  assert.equal(result.quality_score, 1);
  assert.equal(Object.values(result.checks).every(Boolean), true);
});
