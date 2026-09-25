import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function generateEmailHtml(subject: string, message: string): string {
  // Format message lines into clean HTML paragraphs
  const formattedParagraphs = message
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #374151; font-size: 16px;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f5f4; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e7e5e4;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1c1917 0%, #292524 100%); padding: 32px 24px; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; background-color: rgba(234, 88, 12, 0.2); border: 1px solid rgba(234, 88, 12, 0.4); border-radius: 9999px; color: #fb923c; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
                The 2,050 km Pilgrimage
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">
                Walking from Buckinghamshire to Rome
              </h1>
              <p style="margin: 6px 0 0 0; color: #d6d3d1; font-size: 13px;">
                Direct update from Bryn Jones on the trail
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 28px 24px 28px;">
              <h2 style="margin: 0 0 20px 0; color: #1c1917; font-size: 20px; font-weight: 700; line-height: 1.3;">
                ${subject}
              </h2>
              ${formattedParagraphs}

              <!-- Action Buttons -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f5f5f4;">
                <tr>
                  <td align="center">
                    <a href="https://bryn-pilgrimage.vercel.app/#journey" style="display: inline-block; padding: 12px 24px; background-color: #ea580c; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 10px rgba(234, 88, 12, 0.3);">
                      Explore Interactive Route Map
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafaf9; padding: 24px; text-align: center; border-top: 1px solid #e7e5e4;">
              <p style="margin: 0; color: #78716c; font-size: 12px; line-height: 1.5;">
                You received this update because you subscribed to follow Bryn Jones's charity walk from Buckinghamshire to Rome along the Via Francigena.
              </p>
              <p style="margin: 8px 0 0 0; color: #a8a29e; font-size: 11px;">
                &copy; ${new Date().getFullYear()} Bryn Jones. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { subject, message, isTest } = body;

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Subject and message cannot be empty." },
        { status: 400 },
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || resendApiKey.startsWith("re_placeholder")) {
      return NextResponse.json(
        {
          error:
            "Resend API key is not configured in .env.local (RESEND_API_KEY).",
        },
        { status: 400 },
      );
    }

    const resend = new Resend(resendApiKey);
    const fromAddress =
      process.env.RESEND_FROM_EMAIL || "Bryn Jones <onboarding@resend.dev>";
    const emailHtml = generateEmailHtml(subject.trim(), message.trim());

    // 2. Mode A: Send test email to admin
    if (isTest) {
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [adminEmail],
        subject: `[TEST PREVIEW] ${subject.trim()}`,
        html: emailHtml,
      });

      if (error) {
        console.error("[Broadcast API] Resend test email error:", error);
        return NextResponse.json(
          { error: `Resend error: ${error.message}` },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        isTest: true,
        message: `Test email successfully sent to ${adminEmail}`,
        resendId: data?.id,
      });
    }

    // 3. Mode B: Send broadcast to all active subscribers
    const adminSupabase = createAdminClient();
    const { data: subscribers, error: subError } = await adminSupabase
      .from("subscribers")
      .select("email")
      .eq("status", "active");

    if (subError) {
      console.error("[Broadcast API] Error fetching subscribers:", subError);
      return NextResponse.json(
        { error: "Failed to retrieve subscriber list from database." },
        { status: 500 },
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: "No active subscribers found in database." },
        { status: 400 },
      );
    }

    const emails = subscribers.map((s) => s.email);

    // Send emails in batches of up to 50
    let successfulCount = 0;
    const batchSize = 50;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      try {
        const batchResults = await Promise.allSettled(
          batch.map((toEmail) =>
            resend.emails.send({
              from: fromAddress,
              to: [toEmail],
              subject: subject.trim(),
              html: emailHtml,
            }),
          ),
        );

        batchResults.forEach((result) => {
          if (result.status === "fulfilled" && !result.value.error) {
            successfulCount++;
          }
        });
      } catch (batchErr) {
        console.error("[Broadcast API] Batch sending error:", batchErr);
      }
    }

    // Log broadcast in database
    await adminSupabase.from("broadcast_emails").insert({
      subject: subject.trim(),
      content: message.trim(),
      recipient_count: successfulCount,
      status: successfulCount > 0 ? "sent" : "failed",
    });

    return NextResponse.json({
      success: true,
      sentCount: successfulCount,
      totalSubscribers: emails.length,
      message: `Broadcast successfully sent to ${successfulCount} subscriber(s).`,
    });
  } catch (err: unknown) {
    console.error("[Broadcast API] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing the broadcast." },
      { status: 500 },
    );
  }
}

