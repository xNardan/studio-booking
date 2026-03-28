import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "https://esm.sh/nodemailer@6.9.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("[send-email] Otrzymano żądanie wysyłki maila");

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { name, email, bookingDate, bookingHour, duration, engineerName, instagram } = body;
    
    const hostname = Deno.env.get("SMTP_HOSTNAME") || "";
    const user = Deno.env.get("SMTP_USER") || "";
    const password = Deno.env.get("SMTP_PASSWORD") || "";
    const portStr = Deno.env.get("SMTP_PORT") || "587";
    const port = parseInt(portStr);

    console.log(`[send-email] Konfiguracja transportera: ${hostname}:${port}`);

    // Tworzymy transporter Nodemailer
    const transporter = nodemailer.createTransport({
      host: hostname,
      port: port,
      secure: port === 465, // true dla 465, false dla innych (np. 587 z STARTTLS)
      auth: {
        user: user,
        pass: password,
      },
      tls: {
        // Niektóre serwery wymagają tego przy STARTTLS
        rejectUnauthorized: false 
      }
    });

    const startHour = parseInt(bookingHour.split(':')[0]);
    const endHour = startHour + parseInt(duration);
    const timeRange = `${bookingHour} - ${String(endHour).padStart(2, '0')}:00`;

    console.log("[send-email] Wysyłanie maila do klienta...");

    // Mail dla KLIENTA
    await transporter.sendMail({
      from: `"Flow Studio" <${user}>`,
      to: email,
      subject: `Potwierdzenie rezerwacji - Flow Studio`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #333;">Cześć ${name}!</h2>
          <p>Twoja sesja w <strong>Flow Studio</strong> została zarezerwowana.</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p><strong>Data:</strong> ${bookingDate}</p>
          <p><strong>Godzina:</strong> ${timeRange} (${duration}h)</p>
          <p><strong>Realizator:</strong> ${engineerName}</p>
          <p><strong>Miejsce:</strong> Al. Jana Pawła II 11, Biała Podlaska</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #666;">Jeśli chcesz odwołać lub zmienić termin, skontaktuj się z nami na Instagramie @flowstudio.bp lub mailowo.</p>
          <p>Do zobaczenia!</p>
        </div>
      `,
    });

    console.log("[send-email] Wysyłanie maila do studia...");

    // Mail dla STUDIA
    await transporter.sendMail({
      from: `"System Rezerwacji" <${user}>`,
      to: "flowstudiobp@gmail.com",
      subject: `NOWA REZERWACJA: ${bookingDate} o ${bookingHour}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Nowa rezerwacja w systemie!</h2>
          <p><strong>Klient:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Instagram:</strong> ${instagram || 'Nie podano'}</p>
          <p><strong>Termin:</strong> ${bookingDate}, ${timeRange} (${duration}h)</p>
          <p><strong>Realizator:</strong> ${engineerName}</p>
        </div>
      `,
    });

    console.log("[send-email] Sukces: Maile wysłane poprawnie");

    return new Response(JSON.stringify({ message: "Sent" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[send-email] BŁĄD:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});