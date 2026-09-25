import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    // 1. Verify admin session
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
        { error: "Unauthorized: Admin authorization required." },
        { status: 403 },
      );
    }

    // 2. Fetch subscribers and broadcast history
    const adminSupabase = createAdminClient();

    const [subscribersResult, broadcastsResult] = await Promise.all([
      adminSupabase
        .from("subscribers")
        .select("id, email, status, created_at")
        .order("created_at", { ascending: false }),
      adminSupabase
        .from("broadcast_emails")
        .select("id, subject, recipient_count, status, sent_at")
        .order("sent_at", { ascending: false })
        .limit(10),
    ]);

    const subscribers = subscribersResult.data || [];
    const broadcasts = broadcastsResult.data || [];

    return NextResponse.json({
      subscribers,
      totalCount: subscribers.length,
      broadcasts,
    });
  } catch (err: unknown) {
    console.error("[Subscribers API] Error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve admin data." },
      { status: 500 },
    );
  }
}

