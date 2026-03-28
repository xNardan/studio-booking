import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message, bookingDetails } = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY secret");
    }

    console.log(`[send-email] Sending emails via Resend for ${name}`);

    // 1. Mail do studia
    const resStudio = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Flow Studio <onboarding@resend.dev>", // Po weryfikacji domeny zmień na no-reply@flowstudiobp.pl
        to: "flowstudiobp@gmail.com",
        subject: `Nowa rezerwacja: ${name}`,
        text: `Otrzymano nową rezerwację od ${name} (${email}).\n\nSzczegóły:\n${message}`,
      }),
    });

    // 2. Potwierdzenie dla klienta
    const resClient = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Flow Studio <onboarding@resend.dev>",
        to: email,
        subject: "Potwierdzenie rezerwacji - Flow Studio",
        text: `Cześć ${name}!\n\nDziękujemy za rezerwację w Flow Studio.\n\nTwoja sesja została zaplanowana na:\n${bookingDetails}\n\nDo zobaczenia w studio!\nAl. Jana Pawła II 11, Biała Podlaska`,
      }),
    });

    if (!resStudio.ok || !resClient.ok) {
      const err = await resStudio.text();
      console.error("[send-email] Resend API Error:", err);
      throw new Error("Failed to send one or more emails via Resend");
    }

    console.log("[send-email] Emails sent successfully via Resend");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[send-email] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});