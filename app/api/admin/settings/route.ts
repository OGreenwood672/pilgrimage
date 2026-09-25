import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import fundraisingFallback from "@/data/fundraising.json";

// Public GET to fetch current site settings (GoFundMe config, stage status)
export async function GET() {
  try {
    const adminSupabase = createAdminClient();

    // Query site_settings table
    const { data, error } = await adminSupabase
      .from("site_settings")
      .select("key, value");

    if (error || !data || data.length === 0) {
      // Fallback defaults if table is empty or Supabase not connected
      return NextResponse.json({
        gofundme: {
          url:
            process.env.NEXT_PUBLIC_GOFUNDME_URL ||
            "https://www.gofundme.com/f/bryn-walks-south-heath-to-rome",
          amountRaised: fundraisingFallback.amountRaised,
          targetAmount: fundraisingFallback.targetAmount,
          donorCount: fundraisingFallback.donorCount,
          currencySymbol: fundraisingFallback.currencySymbol,
        },
        journey_status: {
          currentSegmentIndex: 0,
          statusNote: "Preparing to set off from Buckinghamshire",
        },
      });
    }

    const settingsMap: Record<string, unknown> = {};
    data.forEach((row) => {
      settingsMap[row.key] = row.value;
    });

    return NextResponse.json(settingsMap);
  } catch (err: unknown) {
    console.error("[Settings API GET] Error:", err);
    return NextResponse.json({
      gofundme: {
        url:
          process.env.NEXT_PUBLIC_GOFUNDME_URL ||
          "https://www.gofundme.com/f/bryn-walks-south-heath-to-rome",
        amountRaised: fundraisingFallback.amountRaised,
        targetAmount: fundraisingFallback.targetAmount,
        donorCount: fundraisingFallback.donorCount,
        currencySymbol: fundraisingFallback.currencySymbol,
      },
      journey_status: {
        currentSegmentIndex: 0,
        statusNote: "Preparing to set off from Buckinghamshire",
      },
    });
  }
}

// Protected POST to update settings
export async function POST(request: Request) {
  try {
    // 1. Verify user authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (
      authError ||
      !user ||
      !adminEmail ||
      user.email?.toLowerCase() !== adminEmail
    ) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || !value) {
      return NextResponse.json(
        { error: "Missing required fields: key and value." },
        { status: 400 },
      );
    }

    const adminSupabase = createAdminClient();
    const { error: upsertError } = await adminSupabase
      .from("site_settings")
      .upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );

    if (upsertError) {
      console.error("[Settings API POST] Error upserting setting:", upsertError);
      return NextResponse.json(
        { error: "Failed to update setting." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, key, value });
  } catch (err: unknown) {
    console.error("[Settings API POST] Error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}

