const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    // Parse the form data from Netlify Forms
    const formData = JSON.parse(event.body);
    
    // Extract form fields
    const { name, email, extras, invite_code } = formData;

    // Get email configuration from environment variables
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const recipientEmail = process.env.RECIPIENT_EMAIL || smtpUser;

    if (!smtpUser || !smtpPassword) {
      console.error('SMTP credentials not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          message: 'Email service not configured. Please set SMTP_USER and SMTP_PASSWORD environment variables.' 
        })
      };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword
      }
    });

    // Email content
    const mailOptions = {
      from: `"Wedding RSVP" <${smtpUser}>`,
      to: recipientEmail,
      subject: `New RSVP from ${name}`,
      html: `
        <h2>New RSVP Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Additional Guests:</strong> ${extras}</p>
        <p><strong>Invite Code:</strong> ${invite_code}</p>
        <hr>
        <p><em>This RSVP was submitted through your wedding website.</em></p>
      `,
      text: `
        New RSVP Received
        
        Name: ${name}
        Email: ${email}
        Additional Guests: ${extras}
        Invite Code: ${invite_code}
        
        This RSVP was submitted through your wedding website.
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'RSVP email sent successfully' 
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Error sending email',
        error: error.message 
      })
    };
  }
};

