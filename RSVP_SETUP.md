# RSVP Form Setup Guide

The RSVP form is now configured to work with Netlify Forms and send email notifications using nodemailer.

## How It Works

1. **Netlify Forms**: Captures form submissions with built-in spam protection
2. **Email Notifications**: A Netlify Function sends email notifications when forms are submitted

## Setup Instructions

### 1. Install Dependencies

Run the following command to install nodemailer:

```bash
npm install
```

### 2. Configure Environment Variables in Netlify

Go to your Netlify dashboard → Site settings → Environment variables and add the following:

- **SMTP_HOST**: Your SMTP server (default: `smtp.gmail.com`)
- **SMTP_PORT**: SMTP port (default: `587` for TLS, `465` for SSL)
- **SMTP_USER**: Your email address (e.g., `your-email@gmail.com`)
- **SMTP_PASSWORD**: Your email app password (NOT your regular password)
- **RECIPIENT_EMAIL**: Email address to receive RSVP notifications (defaults to SMTP_USER if not set)

### 3. Gmail Setup (if using Gmail)

If you're using Gmail, you'll need to:

1. Enable 2-Step Verification on your Google account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password as `SMTP_PASSWORD`

### 4. Other Email Providers

For other email providers, adjust the SMTP settings:

- **Outlook/Hotmail**: `smtp-mail.outlook.com`, port `587`
- **Yahoo**: `smtp.mail.yahoo.com`, port `587`
- **Custom SMTP**: Use your provider's SMTP settings

### 5. Deploy to Netlify

After setting up environment variables, deploy your site. The form will automatically:
- Capture submissions via Netlify Forms
- Send email notifications via the function

## Testing

1. Submit a test RSVP through the form
2. Check your Netlify dashboard → Forms to see the submission
3. Check your email inbox for the notification

## Troubleshooting

- **Emails not sending**: Check that all environment variables are set correctly
- **Function errors**: Check Netlify Function logs in the dashboard
- **Form not submitting**: Ensure `data-netlify="true"` is on the form element

## Form Fields

The form captures:
- **name**: Guest's name
- **email**: Guest's email address
- **plus_one_name**: Name of additional guest (+1)
- **dietary_requirements**: Any dietary requirements or restrictions

