import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@1.1.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // [send-email] Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log("[send-email] Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("[send-email] RESEND_API_KEY is not set in environment variables.");
      return new Response(JSON.stringify({ error: "Server configuration error: Missing API key." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);

    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      console.warn("[send-email] Missing required fields in request body.");
      return new Response(JSON.stringify({ error: "Missing name, email, or message." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[send-email] Attempting to send email from ${email} (${name})`);

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Zmień na zweryfikowany adres e-mail lub domenę Resend
      to: 'flowstudiobp@gmail.com', // Adres docelowy
      subject: `Nowa wiadomość z Flow Studio od ${name}`,
      html: `
        <p><strong>Imię:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Wiadomość:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      console.error("[send-email] Error sending email:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[send-email] Email sent successfully:", data);
    return new Response(JSON.stringify({ message: "Email sent successfully!" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[send-email] Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});