import Anthropic from "@anthropic-ai/sdk";
import type { Account } from "./types";

// ── Tavily search ───────────────────────────────────────────

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

interface TavilyResponse {
  results: TavilyResult[];
}

async function tavilySearch(query: string): Promise<TavilyResult[]> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      max_results: 5,
      search_depth: "basic",
    }),
  });

  if (!res.ok) {
    throw new Error(`Tavily search failed: ${res.status} ${res.statusText}`);
  }

  const data: TavilyResponse = await res.json();
  return data.results;
}

async function searchCompany(company: string): Promise<TavilyResult[]> {
  const [companyResults, contactResults] = await Promise.all([
    tavilySearch(
      `"${company}" revenue operations sales operations CRM technology growth team`
    ),
    tavilySearch(
      `"${company}" revenue operations sales operations chief revenue officer VP sales operations growth operations leader`
    ),
  ]);

  return [...companyResults, ...contactResults];
}

// ── Claude structuring ──────────────────────────────────────

const ACCOUNT_TOOL = {
  name: "create_account",
  description:
    "Extract structured B2B account data from web search results.",
  input_schema: {
    type: "object" as const,
    properties: {
      company: {
        type: "string",
        description: "Official company name",
      },
      industry: {
        type: "string",
        description:
          "Industry sector (e.g., Healthcare, Education, Financial services, Technology, Manufacturing, Transportation/logistics)",
      },
      us_employees: {
        type: "number",
        description:
          "Estimated US employee count. Use best estimate from search results. Default to 5000 if no data found.",
      },
      contact_name: {
        type: ["string", "null"],
        description:
          "Name of a relevant RevOps, Sales Ops, Growth, or revenue leader if found. null if not found.",
      },
      contact_title: {
        type: ["string", "null"],
        description: "Title of the contact if found. null if not found.",
      },
      crm_platform: {
        type: "string",
        description:
          "Primary CRM or GTM system if found (e.g., Salesforce, HubSpot, Microsoft Dynamics). Use 'Unknown' if not found.",
      },
      notes: {
        type: "string",
        description:
          "Key context for prospecting: GTM maturity, process complexity, hiring, recent expansion, or tooling signals. 2-3 sentences.",
      },
    },
    required: [
      "company",
      "industry",
      "us_employees",
      "contact_name",
      "contact_title",
      "crm_platform",
      "notes",
    ],
  },
};

// Module-level cache: same company in the same warm instance → identical result
const enrichmentCache = new Map<string, Account>();

export async function enrichCompany(company: string): Promise<Account> {
  const cacheKey = company.trim().toLowerCase();
  const cached = enrichmentCache.get(cacheKey);
  if (cached) return cached;

  const searchResults = await searchCompany(company);

  const context = searchResults
    .map(
      (r, i) =>
        `[Source ${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content}\n`
    )
    .join("\n---\n");

  const client = new Anthropic();
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    temperature: 0,
    tools: [ACCOUNT_TOOL],
    tool_choice: { type: "tool", name: "create_account" },
    messages: [
      {
        role: "user",
        content: `You are extracting structured B2B account data for a GTM prospecting tool.

Given web search results about "${company}", extract the key fields. Be honest about what you can and cannot find. Use null for missing contacts and "Unknown" for missing CRM platform info.

The first set of results covers company and GTM context. The second set targets relevant commercial leadership contacts.

CRITICAL: Some search results may be about DIFFERENT organizations with similar names (e.g., "Texas State University" when searching for "University of Texas at Austin", or a parent company vs. a subsidiary). Only extract data that clearly belongs to "${company}" itself. Check the URL domain and page title to verify. If a contact or data point comes from a different organization's page, ignore it entirely. When in doubt, use null rather than risk attributing the wrong person to this company.

Focus on:
- Official company name and industry
- US employee count (look for headcount, "employees", workforce size)
- Revenue, sales, growth, or operations leadership contacts. Prefer the most relevant senior GTM operator whose page clearly belongs to "${company}".
- CRM platform or primary GTM system
- Any GTM maturity, growth, tooling, or process-complexity context

Search results:
${context}`,
      },
    ],
  });

  // Extract the tool use result
  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return structured account data");
  }

  const input = toolUse.input as Record<string, unknown>;

  const account: Account = {
    id: 99, // Ad-hoc enrichment
    company: input.company as string,
    industry: input.industry as string,
    us_employees: input.us_employees as number,
    contact_name: (input.contact_name as string) ?? null,
    contact_title: (input.contact_title as string) ?? null,
    crm_platform: input.crm_platform as string,
    notes: input.notes as string,
  };

  enrichmentCache.set(cacheKey, account);
  return account;
}
