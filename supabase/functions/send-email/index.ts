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
    const { name, email, message, bookingDetails, engineerName, isContactForm } = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY secret");
    }

    console.log(`[send-email] Processing ${isContactForm ? 'contact' : 'booking'} request from ${name}`);

    // 1. Mail do studia (zawsze wysyłany)
    const subject = isContactForm ? `Nowe zapytanie: ${name}` : `Nowa rezerwacja: ${name}`;
    const text = isContactForm 
      ? `Otrzymano nową wiadomość z formularza kontaktowego.\n\nOd: ${name} (${email})\n\nTreść:\n${message}`
      : `Otrzymano nową rezerwację od ${name} (${email}).\n\nSzczegóły:\n${message}`;

    const resStudio = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Flow Studio <no-reply@mail.flowstudiobp.pl>",
        to: "flowstudiobp@gmail.com",
        subject: subject,
        text: text,
      }),
    });

    const studioData = await resStudio.json();
    console.log("[send-email] Studio email response:", studioData);

    // 2. Potwierdzenie dla klienta (TYLKO jeśli to rezerwacja, nie formularz kontaktowy)
    if (!isContactForm) {
      const resClient = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Flow Studio <no-reply@mail.flowstudiobp.pl>",
          to: email,
          subject: "Potwierdzenie rezerwacji - Flow Studio",
          text: `Cześć ${name}!\n\nDziękujemy za rezerwację w Flow Studio.\n\nTwoja sesja została zaplanowana na:\n${bookingDetails}\n\nDo zobaczenia w studio!\nAl. Jana Pawła II 11, Biała Podlaska`,
        }),
      });
      const clientData = await resClient.json();
      console.log("[send-email] Client confirmation sent:", clientData);
    }

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