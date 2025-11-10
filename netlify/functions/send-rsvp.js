const nodemailer = require("nodemailer");

const {
  SMTP_HOST,
  SMTP_PORT = "587",
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_SECURE,
  RECIPIENT_EMAIL,
  RSVP_EMAIL_SUBJECT
} = process.env;

const REQUIRED_ENV = ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD"];

function validateEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required SMTP environment variables: ${missing.join(", ")}`);
  }
}

function createTransport() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number.parseInt(SMTP_PORT, 10) || 587,
    secure: SMTP_SECURE === "true" || SMTP_SECURE === "1",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD
    }
  });
}

function buildPlainText(data) {
  const lines = [
    `Name: ${data.name || "—"}`,
    `Email: ${data.email || "—"}`,
    `Attendance: ${data.attendance || "—"}`
  ];

  if (data.plusOne) {
    lines.push(`Plus One: ${data.plusOne}`);
  }
  if (data.dietary) {
    lines.push(`Dietary Notes: ${data.dietary}`);
  }

  return lines.join("\n");
}

function buildHtml(data) {
  const rows = [
    ["Name", data.name || "—"],
    ["Email", data.email || "—"],
    ["Attendance", data.attendance || "—"],
    ["Plus One", data.plusOne || "—"],
    ["Dietary Notes", data.dietary || "—"]
  ]
      .map(
          ([label, value]) =>
              `<tr><th align="left" style="padding: 4px 8px; border-bottom: 1px solid #eee;">${label}</th><td style="padding: 4px 8px; border-bottom: 1px solid #eee;">${value}</td></tr>`
      )
      .join("");

  return `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif;">
    <p>You have received a new RSVP submission:</p>
    <table style="border-collapse: collapse;">${rows}</table>
  </body>
</html>`;
}

exports.handler = async function handler(event, context) {
  const requestId = context.awsRequestId || `local-${Date.now()}`;

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    validateEnv();

    if (!event.body) {
      throw new Error("Missing request body");
    }

    const payload = JSON.parse(event.body);
    console.log(`[${requestId}] Received RSVP payload`, {
      name: payload?.name,
      email: payload?.email,
      attendance: payload?.attendance
    });

    const transporter = createTransport();
    const to = RECIPIENT_EMAIL || SMTP_USER;

    const info = await transporter.sendMail({
      from: `"RSVP" <${SMTP_USER}>`,
      to,
      subject: RSVP_EMAIL_SUBJECT || `New RSVP submission${payload.name ? ` from ${payload.name}` : ""}`,
      text: buildPlainText(payload),
      html: buildHtml(payload)
    });

    console.log(`[${requestId}] RSVP email sent`, info);

    return {
      statusCode: 200,
      body: JSON.stringify({ delivered: true })
    };
  } catch (error) {
    console.error(`[${requestId}] Failed to send RSVP email`, {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ delivered: false, message: error.message })
    };
  }
};

