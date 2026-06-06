import nodemailer from "nodemailer";

import { env } from "../config/env.js";
import { serviceUnavailable } from "../http/errors.js";

let transporter: nodemailer.Transporter | undefined;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const requireSmtpConfig = () => {
  if (!env.smtpHost || !env.smtpPort || !env.smtpUser || !env.smtpPassword) {
    throw serviceUnavailable("SMTP email service is not configured.");
  }

  return {
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPassword
    }
  };
};

const getTransporter = () => {
  transporter ??= nodemailer.createTransport(requireSmtpConfig());
  return transporter;
};

export const emailService = {
  assertConfigured: () => {
    requireSmtpConfig();
  },

  sendEmailVerificationCode: async (input: { to: string; code: string; fullName?: string | null; expiresInMinutes: number }) => {
    const name = input.fullName?.trim() || "there";
    const safeName = escapeHtml(name);
    const safeCode = escapeHtml(input.code);

    await getTransporter().sendMail({
      from: env.smtpFrom,
      to: input.to,
      subject: "Your Galaxy Elite verification code",
      text: [
        `Hello ${name},`,
        "",
        `Your Galaxy Elite Private Match verification code is ${input.code}.`,
        `This code expires in ${input.expiresInMinutes} minutes.`,
        "",
        "If you did not create this account, you can ignore this email."
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#172033">
          <p>Hello ${safeName},</p>
          <p>Your Galaxy Elite Private Match verification code is:</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:4px">${safeCode}</p>
          <p>This code expires in ${input.expiresInMinutes} minutes.</p>
          <p>If you did not create this account, you can ignore this email.</p>
        </div>
      `
    });
  }
};
