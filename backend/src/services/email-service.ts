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

type CodeEmailInput = {
  to: string;
  code: string;
  fullName?: string | null;
  expiresInMinutes: number;
};

type CodeEmailContent = {
  title: string;
  eyebrow: string;
  intro: string;
  codeLabel: string;
  securityNote: string;
  plainPurpose: string;
};

const buildCodeEmailHtml = (input: CodeEmailInput, content: CodeEmailContent) => {
  const name = input.fullName?.trim() || "there";
  const safeName = escapeHtml(name);
  const safeCode = escapeHtml(input.code);

  return `
    <div style="margin:0;padding:0;background:#03060b;color:#08111f;font-family:Arial,Helvetica,sans-serif">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(content.plainPurpose)} code: ${safeCode}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#03060b;margin:0;padding:0;width:100%">
        <tr>
          <td align="center" style="padding:34px 14px">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;max-width:620px;background:#fbf6eb;border-radius:28px;overflow:hidden;border:1px solid rgba(212,175,102,.34);box-shadow:0 28px 80px rgba(0,0,0,.32)">
              <tr>
                <td style="padding:32px 34px;background:#07111f;background-image:linear-gradient(145deg,#03060b,#07111f 58%,#0b1727);border-bottom:1px solid rgba(245,223,170,.20)">
                  <div style="font-size:12px;line-height:1.4;font-weight:900;text-transform:uppercase;letter-spacing:3px;color:#d4af66;margin-bottom:14px">${escapeHtml(content.eyebrow)}</div>
                  <div style="font-size:30px;line-height:1.15;font-weight:900;color:#fffaf0;margin:0">Galaxy Elite Private Match</div>
                  <div style="height:3px;width:92px;background:linear-gradient(90deg,#a77a35,#d4af66,#f5dfaa);border-radius:999px;margin-top:20px"></div>
                </td>
              </tr>
              <tr>
                <td style="padding:34px;color:#08111f">
                  <h1 style="font-size:26px;line-height:1.2;margin:0 0 14px;color:#08111f;font-weight:900">${escapeHtml(content.title)}</h1>
                  <p style="font-size:16px;line-height:1.65;margin:0 0 20px;color:#334155">Hello ${safeName},</p>
                  <p style="font-size:16px;line-height:1.65;margin:0 0 24px;color:#334155">${escapeHtml(content.intro)}</p>
                  <div style="background:#fffaf0;border:1px solid rgba(212,175,102,.45);border-radius:22px;padding:24px;text-align:center;margin:0 0 24px">
                    <div style="font-size:11px;line-height:1.4;text-transform:uppercase;letter-spacing:2px;font-weight:900;color:#a77a35;margin-bottom:10px">${escapeHtml(content.codeLabel)}</div>
                    <div style="font-size:40px;line-height:1;font-weight:900;letter-spacing:8px;color:#08111f">${safeCode}</div>
                  </div>
                  <p style="font-size:15px;line-height:1.6;margin:0 0 18px;color:#334155">This code expires in <strong style="color:#08111f">${input.expiresInMinutes} minutes</strong>.</p>
                  <p style="font-size:14px;line-height:1.6;margin:0;color:#667085">${escapeHtml(content.securityNote)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 34px;background:#fffaf0;border-top:1px solid rgba(8,17,31,.08);color:#667085;font-size:12px;line-height:1.6">
                  Private Match access is protected by secure email codes and backend-issued sessions.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
};

const sendCodeEmail = async (input: CodeEmailInput, content: CodeEmailContent) => {
  const name = input.fullName?.trim() || "there";

  await getTransporter().sendMail({
    from: env.smtpFrom,
    to: input.to,
    subject: content.title,
    text: [
      `Hello ${name},`,
      "",
      `${content.plainPurpose} code is ${input.code}.`,
      `This code expires in ${input.expiresInMinutes} minutes.`,
      "",
      content.securityNote
    ].join("\n"),
    html: buildCodeEmailHtml(input, content)
  });
};

export const emailService = {
  assertConfigured: () => {
    requireSmtpConfig();
  },

  sendEmailVerificationCode: async (input: CodeEmailInput) => {
    await sendCodeEmail(input, {
      title: "Your Galaxy Elite verification code",
      eyebrow: "Email verification",
      intro: "Use this code to verify your email and activate your private match account.",
      codeLabel: "Verification code",
      plainPurpose: "Your Galaxy Elite Private Match verification",
      securityNote: "If you did not create this account, you can ignore this email."
    });
  },

  sendPasswordResetCode: async (input: CodeEmailInput) => {
    await sendCodeEmail(input, {
      title: "Reset your Galaxy Elite password",
      eyebrow: "Password reset",
      intro: "Use this code to set a new password for your private match account.",
      codeLabel: "Reset code",
      plainPurpose: "Your Galaxy Elite Private Match password reset",
      securityNote: "If you did not request a password reset, you can ignore this email."
    });
  }
};
