import { NextRequest, NextResponse } from "next/server";
import { runs } from "@trigger.dev/sdk/v3";
import { validateDemoAccess } from "@/lib/access";

export async function GET(req: NextRequest) {
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

  const runId = req.nextUrl.searchParams.get("runId");

  if (!runId) {
    return NextResponse.json(
      { error: "runId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const run = await runs.retrieve(runId);

    return NextResponse.json({
      status: run.status,
      output: run.status === "COMPLETED" ? run.output : undefined,
    });
  } catch (err) {
    console.error("Status API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
