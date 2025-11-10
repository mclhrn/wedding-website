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

function buildTransport() {
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

function formatSubmission(data = {}) {
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return "No submission data received.";
  }
  return entries
      .map(([key, value]) => `${key}: ${value ?? "—"}`)
      .join("\n");
}

function formatHtml(data = {}) {
  const rows = Object.entries(data)
      .map(
          ([key, value]) =>
              `<tr><th align="left" style="padding: 4px 8px; border-bottom: 1px solid #eee;">${key}</th><td style="padding: 4px 8px; border-bottom: 1px solid #eee;">${value ?? "—"}</td></tr>`
      )
      .join("");

  return `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif;">
    <p>You have received a new Netlify form submission:</p>
    <table style="border-collapse: collapse;">${rows}</table>
  </body>
</html>`;
}

exports.handler = async function handler(event, context) {
  const requestId = context.awsRequestId || Date.now().toString();
  try {
    validateEnv();

    if (!event.body) {
      throw new Error("Missing submission payload");
    }

    const payload = JSON.parse(event.body);
    console.log(`[${requestId}] submission-created payload`, payload);

    const submission = payload?.payload?.data ?? payload?.data ?? {};
    const formName = payload?.payload?.form_name ?? payload?.form_name ?? "rsvp";

    const transporter = buildTransport();
    const to = RECIPIENT_EMAIL || SMTP_USER;
    const defaultSubject = `New ${formName.toUpperCase()} submission${submission.name ? ` from ${submission.name}` : ""}`;

    const info = await transporter.sendMail({
      from: `"RSVP" <${SMTP_USER}>`,
      to,
      subject: RSVP_EMAIL_SUBJECT || defaultSubject,
      text: formatSubmission(submission),
      html: formatHtml(submission)
    });

    console.log(`[${requestId}] RSVP email sent`, info);

    return {
      statusCode: 200,
      body: JSON.stringify({ delivered: true })
    };
  } catch (error) {
    console.error(`[${requestId}] Failed to process submission-created event`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ delivered: false, message: error.message })
    };
  }
};
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

function buildTransport() {
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

function formatSubmission(data = {}) {
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

function formatHtml(data = {}) {
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
    <p>You have received a new RSVP:</p>
    <table style="border-collapse: collapse;">${rows}</table>
  </body>
</html>`;
}

exports.handler = async function handler(event) {
  try {
    validateEnv();

    if (!event.body) {
      throw new Error("Missing submission payload");
    }

    const payload = JSON.parse(event.body);
    const submission = payload?.payload?.data ?? payload?.data ?? {};
    const formName = payload?.payload?.form_name ?? payload?.form_name ?? "rsvp";

    const transporter = buildTransport();
    const to = RECIPIENT_EMAIL || SMTP_USER;
    const defaultSubject = `New ${formName.toUpperCase()} submission${submission.name ? ` from ${submission.name}` : ""}`;

    await transporter.sendMail({
      from: `"RSVP" <${SMTP_USER}>`,
      to,
      subject: RSVP_EMAIL_SUBJECT || defaultSubject,
      text: formatSubmission(submission),
      html: formatHtml(submission)
    });

    console.log(`RSVP email sent to ${to}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ delivered: true })
    };
  } catch (error) {
    console.error("Failed to process submission-created event", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ delivered: false, message: error.message })
    };
  }
};

