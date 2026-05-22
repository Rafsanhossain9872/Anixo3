const sendEmail = async (options) => {
  const url = 'https://api.brevo.com/v3/smtp/email';
  const payload = {
    sender: { name: 'Anixo Support', email: process.env.EMAIL_USER },
    to: [{ email: options.email }],
    subject: options.subject,
    htmlContent: options.html || options.message
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API Error:', errorData);
      throw new Error('Failed to send email via API');
    }
  } catch (error) {
    console.error('Email Dispatch Error:', error);
    throw error;
  }
};

export default sendEmail;
