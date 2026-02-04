import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

const canSendEmail =
  SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM;

export const sendOrderEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  if (!canSendEmail) {
    console.warn('SMTP is not configured. Skipping email.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    html,
  });
};
