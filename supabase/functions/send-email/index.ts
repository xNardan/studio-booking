import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

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

    const client = new SmtpClient();
    
    await client.connectTLS({
      hostname: Deno.env.get("SMTP_HOSTNAME") || "",
      port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
      username: Deno.env.get("SMTP_USER") || "",
      password: Deno.env.get("SMTP_PASSWORD") || "",
    });

    console.log("[send-email] Connected to SMTP server");

    // 1. Mail do studia (wszystkie dane)
    await client.send({
      from: Deno.env.get("SMTP_USER") || "",
      to: "flowstudiobp@gmail.com",
      subject: `Nowa rezerwacja: ${name}`,
      content: `Otrzymano nową rezerwację od ${name} (${email}).\n\nSzczegóły:\n${message}`,
    });

    // 2. Potwierdzenie dla klienta
    await client.send({
      from: Deno.env.get("SMTP_USER") || "",
      to: email,
      subject: "Potwierdzenie rezerwacji - Flow Studio",
      content: `Cześć ${name}!\n\nDziękujemy za rezerwację w Flow Studio.\n\nTwoja sesja została zaplanowana na:\n${bookingDetails}\n\nDo zobaczenia w studio!\nAl. Jana Pawła II 11, Biała Podlaska`,
    });

    await client.close();
    console.log("[send-email] Emails sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[send-email] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});