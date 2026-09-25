import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Check if Supabase credentials are configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
      // In local dev without keys configured yet, log and respond gracefully
      console.warn("[Subscribe API] Supabase keys not set up in environment.");
      return NextResponse.json({
        success: true,
        message: "Thank you for following! (Development mode: Supabase keys not configured yet)",
      });
    }

    // Attempt insertion
    const { error } = await supabase.from("subscribers").insert({
      email,
      status: "active",
    });

    if (error) {
      // Duplicate email (PostgreSQL error code 23505)
      if (error.code === "23505") {
        return NextResponse.json({
          success: true,
          message: "You're already subscribed! Thank you for walking alongside Bryn.",
          alreadySubscribed: true,
        });
      }

      console.error("[Subscribe API] Database insert error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save subscription. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "You're in! You will receive Bryn's updates from the trail.",
    });
  } catch (err: unknown) {
    console.error("[Subscribe API] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again later." },
      { status: 500 },
    );
  }
}

