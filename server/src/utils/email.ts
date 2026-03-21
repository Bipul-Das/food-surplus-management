// server/src/utils/email.ts

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    await transporter.sendMail({
      from: `"FoodSurplus System" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text,
    });
    console.log(`[EMAIL] Sent successfully to ${to}`);
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error);
    // We log the error but do not throw it, to prevent the API from crashing 
    // and revealing to the user that the email sending failed.
  }
};

{/*// server/src/utils/email.ts
import nodemailer from 'nodemailer';

// ----------------------------------------------------------------------
// SMTP TRANSPORT CONFIGURATION
// ----------------------------------------------------------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465 (Google SSL), false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ----------------------------------------------------------------------
// EMAIL TRANSMISSION SERVICE
// ----------------------------------------------------------------------
export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Logistics Network" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text,
    });
    
    // Log the Message ID for auditing purposes
    console.log(`[SYS-MAIL] Transmitted successfully to ${to} | ID: ${info.messageId}`);
    
  } catch (error) {
    console.error(`[SYS-MAIL-ERROR] Transmission failed to ${to}:`, error);
    // Security Mandate: Fail silently to the client to prevent enumeration attacks.
  }
};*/}