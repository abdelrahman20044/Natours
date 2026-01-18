const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates
    },
  });

  // 2 ) define the email options
  const maiOptions = {
    from: 'Abdelrahman <mansy@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) actually send the email
  await transporter.sendMail(maiOptions);
};

module.exports = sendEmail;

/*the host is the email service and port is the how server connect to it (email port)
the user and the pass here to tell mailtrap this me iam that server
so in in this transporter creation step is to establish the connection between the mailtrap and the server
and then send email method is the method that we use to send and email to user
transporter.sendMail(maiOptions);
so this mean transporter which is the connection between mailtrap and server send email from the server to the user mailtrap email which is option.email and send the message etch..*/
