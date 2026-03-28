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
    
    // Get SMTP configuration from environment variables
    const hostname = Deno.env.get("SMTP_HOSTNAME");
    const user = Deno.env.get("SMTP_USER");
    const password = Deno.env.get("SMTP_PASSWORD");
    const portStr = Deno.env.get("SMTP_PORT") || "465";
    const port = parseInt(portStr);
    
    // Validate required environment variables    if (!hostname || !user || !password) {
      console.error("[send-email] Missing SMTP configuration:", { 
        hostname: !!hostname, 
        user: !!user, 
        password: !!password,
        port      });
      return new Response(JSON.stringify({ 
        error: "SMTP configuration missing. Please check SMTP_HOSTNAME, SMTP_USER, SMTP_PASSWORD environment variables." 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[send-email] Attempting SMTP connection to ${hostname}:${port} for user ${user}`);

    // Configure nodemailer with better debugging
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        host: hostname,
        port: port,
        secure: port === 465, // True for 465 (SSL), false for other ports
        auth: {
          user: user,
          pass: password,
        },
        tls: {
          // Do not fail on invalid certs
          rejectUnauthorized: false,
          // Enable debugging if needed
          // minVersion: 'TLSv1.2'
        },
        // Increase timeout for connection
        connectionTimeout: 30000,
        // Debugging
        debug: true,
        logger: true
      });

      // Verify connection configuration
      console.log("[send-email] SMTP transporter created successfully");
    } catch (configError) {
      console.error("[send-email] SMTP configuration error:", configError);
      return new Response(JSON.stringify({ 
        error: `SMTP configuration failed: ${configError.message}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Send emails with individual error handling    const sendResults = [];
    for (let i = 0; i < mailOptions.length; i++) {
      const option = mailOptions[i];
      try {
        console.log(`[send-email] Sending email ${i+1}/${mailOptions.length} to: ${option.to}`);
        const info = await transporter.sendMail(option);
        console.log(`[send-email] Email ${i+1} sent successfully:`, info.messageId);
        sendResults.push({ success: true, messageId: info.messageId });
      } catch (emailError) {
        console.error(`[send-email] Failed to send email ${i+1}:`, emailError);
        sendResults.push({ success: false, error: emailError.message });
        // Continue to try sending other emails even if one fails
      }
    }

    // Check if at least one email was sent successfully    const successfulSends = sendResults.filter(r => r.success).length;
    if (successfulSends === 0) {
      throw new Error("Failed to send any emails");
    }

    console.log("[send-email] Email sending process completed", { successfulSends, total: mailOptions.length });
    return new Response(JSON.stringify({ 
      message: `Partial success: ${successfulSends}/${mailOptions.length} emails sent`,
      details: sendResults
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[send-email] CRITICAL ERROR:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Unknown error occurred",
      // Include stack trace in development
      ...(Deno.env.get("ENVIRONMENT") !== "production" && { stack: error.stack })
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});