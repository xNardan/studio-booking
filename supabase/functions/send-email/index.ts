import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "https://esm.sh/nodemailer@6.9.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { name, email, bookingDate, bookingHour, duration, engineerName, instagram } = body;
    
    const hostname = Deno.env.get("SMTP_HOSTNAME");
    const user = Deno.env.get("SMTP_USER");
    const password = Deno.env.get("SMTP_PASSWORD");
    const portStr = Deno.env.get("SMTP_PORT") || "465";
    const port = parseInt(portStr);

    console.log(`[send-email] Próba wysyłki przez ${hostname}:${port} dla ${user}`);

    const transporter = nodemailer.createTransport({
      host: hostname,
      port: port,
      secure: port === 465, // True dla 465 (SSL), False dla 587 (STARTTLS)
      auth: {
        user: user,
        pass: password,
      },
      tls: {
        // Ignorowanie błędów certyfikatów i wymuszenie TLS
        rejectUnauthorized: false
      }
    });

    const startHour = parseInt(bookingHour.split(':')[0]);
    const endHour = startHour + parseInt(duration);
    const timeRange = `${bookingHour} - ${String(endHour).padStart(2, '0')}:00`;

    const mailOptions = [
      {
        from: `"Flow Studio" <${user}>`,
        to: email,
        subject: `Potwierdzenie rezerwacji - Flow Studio`,
        html: `<p>Cześć ${name}!</p><p>Twoja sesja: <b>${bookingDate}</b> o <b>${timeRange}</b>.</p><p>Realizator: ${engineerName}</p>`
      },
      {
        from: `"System" <${user}>`,
        to: "flowstudiobp@gmail.com",
        subject: `NOWA REZERWACJA: ${bookingDate}`,
        html: `<p>Klient: ${name} (${email})</p><p>IG: ${instagram || 'Brak'}</p><p>Termin: ${bookingDate}, ${timeRange}</p>`
      }
    ];

    // Wysyłka
    for (const option of mailOptions) {
      await transporter.sendMail(option);
    }

    console.log("[send-email] Maile wysłane pomyślnie");
    return new Response(JSON.stringify({ message: "Success" }), {
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