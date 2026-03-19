import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { enrichCompany } from "@/lib/enrichment";
import { validateDemoAccess } from "@/lib/access";

export async function POST(req: NextRequest) {
  try {
    const accessError = validateDemoAccess({
      host: req.headers.get("host"),
      expectedToken: process.env.DEMO_ACCESS_TOKEN,
      providedToken: req.headers.get("x-demo-token"),
    });

    if (accessError) {
      return NextResponse.json(
        { error: accessError.error },
        { status: accessError.status }
      );
    }

    const { company } = await req.json();

    if (!company || typeof company !== "string" || company.trim().length === 0) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    // Step 1: Enrich company via Tavily + Claude
    const enrichedAccount = await enrichCompany(company.trim());

    // Step 2: Trigger the prospect-account task on trigger.dev
    const handle = await tasks.trigger("prospect-account", enrichedAccount);

    return NextResponse.json({
      runId: handle.id,
      enrichedAccount,
    });
  } catch (err) {
    console.error("Prospect API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
