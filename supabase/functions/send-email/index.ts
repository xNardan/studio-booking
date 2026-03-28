import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

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
    
    const client = new SmtpClient();
    const hostname = Deno.env.get("SMTP_HOSTNAME") || "";
    const user = Deno.env.get("SMTP_USER") || "";
    const password = Deno.env.get("SMTP_PASSWORD") || "";
    const portStr = Deno.env.get("SMTP_PORT") || "465";
    const port = parseInt(portStr);

    console.log(`[send-email] Próba połączenia z ${hostname}:${port} jako ${user}`);

    // Próba połączenia z obsługą błędów szyfrowania
    try {
      if (port === 465) {
        console.log("[send-email] Próba connectTLS (port 465)");
        await client.connectTLS({
          hostname,
          port,
          username: user,
          password: password,
        });
      } else {
        console.log(`[send-email] Próba connect (port ${port})`);
        await client.connect({
          hostname,
          port,
          username: user,
          password: password,
        });
      }
    } catch (connError) {
      console.error("[send-email] Pierwsza próba połączenia nieudana:", connError.message);
      
      // Jeśli 465 zawiodło, spróbujmy zwykłego connect (niektóre serwery tak mają)
      console.log("[send-email] Próba alternatywnej metody połączenia...");
      await client.connect({
        hostname,
        port,
        username: user,
        password: password,
      });
    }

    console.log("[send-email] Połączono pomyślnie z serwerem SMTP");

    const startHour = parseInt(bookingHour.split(':')[0]);
    const endHour = startHour + parseInt(duration);
    const timeRange = `${bookingHour} - ${String(endHour).padStart(2, '0')}:00`;

    // 1. Mail dla KLIENTA
    await client.send({
      from: user,
      to: email,
      subject: `Potwierdzenie rezerwacji - Flow Studio`,
      content: `
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
      html: true,
    });

    // 2. Mail dla STUDIA
    await client.send({
      from: user,
      to: "flowstudiobp@gmail.com",
      subject: `NOWA REZERWACJA: ${bookingDate} o ${bookingHour}`,
      content: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Nowa rezerwacja w systemie!</h2>
          <p><strong>Klient:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Instagram:</strong> ${instagram || 'Nie podano'}</p>
          <p><strong>Termin:</strong> ${bookingDate}, ${timeRange} (${duration}h)</p>
          <p><strong>Realizator:</strong> ${engineerName}</p>
        </div>
      `,
      html: true,
    });

    console.log("[send-email] Maile wysłane pomyślnie");
    await client.close();

    return new Response(JSON.stringify({ message: "Emails sent successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[send-email] KRYTYCZNY BŁĄD:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});