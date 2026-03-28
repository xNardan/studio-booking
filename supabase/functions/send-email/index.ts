import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "https://esm.sh/nodemailer@6.9.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("[send-email] Start żądania");

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { name, email, bookingDate, bookingHour, duration, engineerName, instagram } = body;
    
    const hostname = Deno.env.get("SMTP_HOSTNAME");
    const user = Deno.env.get("SMTP_USER");
    const password = Deno.env.get("SMTP_PASSWORD");
    const portStr = Deno.env.get("SMTP_PORT") || "587";
    const port = parseInt(portStr);

    if (!hostname || !user || !password) {
      throw new Error("Brak zmiennych środowiskowych SMTP w Supabase.");
    }

    console.log(`[send-email] Łączenie z: ${hostname}:${port} (Użytkownik: ${user})`);

    // Bardziej restrykcyjna, ale stabilna konfiguracja
    const transporter = nodemailer.createTransport({
      host: hostname,
      port: port,
      secure: port === 465, // true dla 465, false dla 587
      auth: {
        user: user,
        pass: password,
      },
      tls: {
        // Wymuszamy TLS 1.2+ i ignorujemy błędy certyfikatów (częste u polskich dostawców)
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false
      },
      connectionTimeout: 10000, // 10 sekund na połączenie
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    // Test połączenia
    console.log("[send-email] Weryfikacja połączenia z serwerem...");
    try {
      await transporter.verify();
      console.log("[send-email] Połączenie SMTP zweryfikowane pomyślnie");
    } catch (verifyError) {
      console.error("[send-email] Błąd weryfikacji połączenia:", verifyError.message);
      throw new Error(`Nie udało się połączyć z serwerem SMTP: ${verifyError.message}`);
    }

    const startHour = parseInt(bookingHour.split(':')[0]);
    const endHour = startHour + parseInt(duration);
    const timeRange = `${bookingHour} - ${String(endHour).padStart(2, '0')}:00`;

    const clientMail = {
      from: `"Flow Studio" <${user}>`,
      to: email,
      subject: `Potwierdzenie rezerwacji - Flow Studio`,
      html: `<div style="font-family: sans-serif; padding: 20px;">
        <h2>Cześć ${name}!</h2>
        <p>Twoja sesja została zarezerwowana na <strong>${bookingDate}</strong> o godzinie <strong>${timeRange}</strong>.</p>
        <p>Realizator: ${engineerName}</p>
        <p>Do zobaczenia!</p>
      </div>`
    };

    const studioMail = {
      from: `"System Rezerwacji" <${user}>`,
      to: "flowstudiobp@gmail.com",
      subject: `NOWA REZERWACJA: ${bookingDate} o ${bookingHour}`,
      html: `<div style="font-family: sans-serif; padding: 20px;">
        <h2>Nowa rezerwacja!</h2>
        <p>Klient: ${name} (${email})</p>
        <p>IG: ${instagram || 'Brak'}</p>
        <p>Termin: ${bookingDate}, ${timeRange}</p>
        <p>Realizator: ${engineerName}</p>
      </div>`
    };

    console.log("[send-email] Wysyłanie wiadomości...");
    await Promise.all([
      transporter.sendMail(clientMail),
      transporter.sendMail(studioMail)
    ]);

    console.log("[send-email] Sukces!");
    return new Response(JSON.stringify({ message: "Sent" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[send-email] KRYTYCZNY BŁĄD:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});