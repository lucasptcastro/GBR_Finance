import { User } from "better-auth";
import nodemailer from "nodemailer";

interface SendResetPasswordEmailProps {
  user: User;
  url: string;
}

interface SendWelcomeEmailProps {
  name: string;
  email: string;
  resetUrl: string;
}

// Configuração do transporte de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: parseInt(process.env.SMTP_PORT || "587") === 465, // true para 465 (SSL), false para 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Configurações adicionais para melhor compatibilidade
  connectionTimeout: 60000, // 60 segundos
  greetingTimeout: 30000, // 30 segundos
  socketTimeout: 60000, // 60 segundos
});

export async function sendResetPasswordEmail({
  user,
  url,
}: SendResetPasswordEmailProps) {
  // Template HTML para o email
  const emailHtml = `
    <!doctype html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Redefinir Senha - Groves Finanças</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
          min-height: 100vh;
        }

        .email-container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .header {
          text-align: center;
          padding: 60px 40px 40px;
          background: linear-gradient(135deg, #f0fdf4 0%, #edfcf5 100%);
        }

        .logo-text {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: 2px;
          margin-bottom: 24px;
        }

        .reset-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .title {
          font-size: 28px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
          line-height: 1.3;
        }

        .subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-top: 8px;
        }

        .content {
          padding: 40px;
        }

        .greeting {
          font-size: 18px;
          font-weight: 500;
          color: #1a1a1a;
          margin: 0 0 24px 0;
        }

        .message {
          font-size: 16px;
          line-height: 1.7;
          color: #4a4a4a;
          margin: 0 0 32px 0;
        }

        .highlight-box {
          background: #f8fafc;
          border-left: 4px solid #18cb96;
          padding: 20px 24px;
          border-radius: 0 12px 12px 0;
          margin: 0 0 32px 0;
        }

        .highlight-box p {
          margin: 0;
          font-size: 15px;
          color: #374151;
          line-height: 1.6;
        }

        .button-container {
          text-align: center;
          margin: 32px 0;
        }

        .action-button {
          display: inline-block;
          padding: 18px 48px;
          background: #18cb96;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }

        .info-list {
          margin: 32px 0;
          padding: 0;
          list-style: none;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .info-icon {
          margin-right: 12px;
          flex-shrink: 0;
          font-size: 18px;
        }

        .info-text {
          font-size: 15px;
          color: #4a4a4a;
          line-height: 1.6;
          padding-top: 1px;
        }

        .footer {
          text-align: center;
          padding: 24px 40px 32px;
          border-top: 1px solid #f0f0f0;
        }

        .footer p {
          font-size: 13px;
          color: #9ca3af;
          margin: 0;
          line-height: 1.5;
        }

        @media (max-width: 640px) {
          .email-container { margin: 20px; border-radius: 16px; }
          .header { padding: 40px 24px 24px; }
          .content { padding: 24px; }
          .title { font-size: 24px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo-text">Groves Finanças</div>
          <div class="reset-icon">🔑</div>
          <h1 class="title">Redefinir senha</h1>
          <p class="subtitle">Solicitação de redefinição de senha</p>
        </div>

        <div class="content">
          <p class="greeting">Olá, ${user.name}!</p>

          <p class="message">
            Recebemos uma solicitação para redefinir a senha da sua conta no
            <strong>Groves Finanças</strong>. Clique no botão abaixo para criar uma nova senha.
          </p>

          <div class="highlight-box">
            <p>
              🔐 Por segurança, o link abaixo é válido por <strong>1 hora</strong>.
              Caso expire, solicite um novo link na tela de login.
            </p>
          </div>

          <div class="button-container">
            <a href="${url}" class="action-button">Redefinir minha senha</a>
          </div>

          <div class="info-list">
            <div class="info-item">
              <span class="info-icon">⏱️</span>
              <span class="info-text">Este link expira em 1 hora por segurança</span>
            </div>
            <div class="info-item">
              <span class="info-icon">🔒</span>
              <span class="info-text">Sua senha atual permanece ativa até que você a altere</span>
            </div>
            <div class="info-item">
              <span class="info-icon">⚠️</span>
              <span class="info-text">Se você não solicitou esta redefinição, ignore este e-mail</span>
            </div>
          </div>

          <p class="message" style="margin-top: 40px; font-size: 14px;">
            Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br />
            <span style="color: #4285f4; word-break: break-all;">${url}</span>
          </p>

          <p class="message" style="margin-bottom: 0;">
            Obrigado,<br />
            <strong>Equipe Groves</strong>
          </p>
        </div>

        <div class="footer">
          <p>
            Este e-mail foi enviado automaticamente pelo sistema Groves Finanças.<br />
            Se você não solicitou a redefinição de senha, por favor ignore este e-mail.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Configurações do email
  const mailOptions = {
    from: `"Groves Finanças" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: "Redefinir Senha - Groves Finanças",
    html: emailHtml,
    text: `
            Olá, ${user.name}!

            Você solicitou a redefinição de sua senha no Groves Finanças.
            
            Acesse o link abaixo para definir uma nova senha:
            ${url}
            
            Este link expira em 1 hora por segurança.
            
            Se você não solicitou esta redefinição, ignore este email.

            Groves Finanças - Sistema de Gestão Financeira
          `,
  };

  // Enviar email
  await transporter.sendMail(mailOptions);
}

export async function sendWelcomeEmail({
  name,
  email,
  resetUrl,
}: SendWelcomeEmailProps) {
  const emailHtml = `
    <!doctype html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Bem-vindo ao Groves Finanças</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
          min-height: 100vh;
        }

        .email-container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .header {
          text-align: center;
          padding: 60px 40px 40px;
          background: linear-gradient(135deg, #f0fdf4 0%, #edfcf5 100%);
        }

        .logo-text {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: 2px;
          margin-bottom: 24px;
        }

        .welcome-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .title {
          font-size: 28px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
          line-height: 1.3;
        }

        .subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-top: 8px;
        }

        .content {
          padding: 40px;
        }

        .greeting {
          font-size: 18px;
          font-weight: 500;
          color: #1a1a1a;
          margin: 0 0 24px 0;
        }

        .message {
          font-size: 16px;
          line-height: 1.7;
          color: #4a4a4a;
          margin: 0 0 32px 0;
        }

        .highlight-box {
          background: #f8fafc;
          border-left: 4px solid #18cb96;
          padding: 20px 24px;
          border-radius: 0 12px 12px 0;
          margin: 0 0 32px 0;
        }

        .highlight-box p {
          margin: 0;
          font-size: 15px;
          color: #374151;
          line-height: 1.6;
        }

        .button-container {
          text-align: center;
          margin: 32px 0;
        }

        .action-button {
          display: inline-block;
          padding: 18px 48px;
          background: #18cb96;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }

        .steps {
          margin: 32px 0;
        }

        .step {
          display: flex;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .step-number {
          background: #18cb96;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: inline-block;
          text-align: center;
          line-height: 28px;
          font-size: 14px;
          font-weight: 600;
          margin-right: 14px;
          flex-shrink: 0;
        }

        .step-text {
          font-size: 15px;
          color: #4a4a4a;
          line-height: 1.6;
          padding-top: 3px;
        }

        .footer {
          text-align: center;
          padding: 24px 40px 32px;
          border-top: 1px solid #f0f0f0;
        }

        .footer p {
          font-size: 13px;
          color: #9ca3af;
          margin: 0;
          line-height: 1.5;
        }

        @media (max-width: 640px) {
          .email-container { margin: 20px; border-radius: 16px; }
          .header { padding: 40px 24px 24px; }
          .content { padding: 24px; }
          .title { font-size: 24px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo-text">Groves Finanças</div>
          <div class="welcome-icon">🎉</div>
          <h1 class="title">Bem-vindo à equipe!</h1>
          <p class="subtitle">Sua conta foi criada com sucesso</p>
        </div>

        <div class="content">
          <p class="greeting">Olá, ${name}!</p>

          <p class="message">
            Sua conta no <strong>Groves Finanças</strong> foi criada por um administrador do sistema.
            Para começar a usar a plataforma, você precisa definir sua senha de acesso.
          </p>

          <div class="highlight-box">
            <p>
              🔐 Por segurança, o link abaixo é válido por <strong>1 hora</strong>.
              Caso expire, solicite um novo link na tela de login.
            </p>
          </div>

          <div class="steps">
            <div class="step">
              <span class="step-number">1</span>
              <span class="step-text">Clique no botão abaixo para definir sua senha</span>
            </div>
            <div class="step">
              <span class="step-number">2</span>
              <span class="step-text">Escolha uma senha segura com pelo menos 8 caracteres</span>
            </div>
            <div class="step">
              <span class="step-number">3</span>
              <span class="step-text">Faça login com seu e-mail e a nova senha</span>
            </div>
          </div>

          <div class="button-container">
            <a href="${resetUrl}" class="action-button">Definir minha senha</a>
          </div>

          <p class="message" style="margin-top: 40px; font-size: 14px;">
            Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br />
            <span style="color: #4285f4; word-break: break-all;">${resetUrl}</span>
          </p>

          <p class="message" style="margin-bottom: 0;">
            Obrigado,<br />
            <strong>Equipe Groves</strong>
          </p>
        </div>

        <div class="footer">
          <p>
            Este e-mail foi enviado automaticamente pelo sistema Groves Finanças.<br />
            Se você não reconhece esta conta, por favor ignore este e-mail.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Groves Finanças" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Bem-vindo ao Groves Finanças - Defina sua senha",
    html: emailHtml,
    text: `
Olá, ${name}!

Sua conta no Groves Finanças foi criada por um administrador do sistema.
Para começar a usar a plataforma, você precisa definir sua senha de acesso.

Acesse o link abaixo para definir sua senha:
${resetUrl}

Este link expira em 1 hora por segurança.

Se você não reconhece esta conta, ignore este e-mail.

Groves Finanças - Sistema de Gestão Financeira
    `,
  };

  await transporter.sendMail(mailOptions);
}

interface SendInvestmentPriceAlertEmailProps {
  name: string;
  email: string;
  investmentName: string;
  ticker: string;
  condition: "above" | "below";
  targetPrice: string;
  currentPrice: string;
  investmentsUrl: string;
}

export async function sendInvestmentPriceAlertEmail({
  name,
  email,
  investmentName,
  ticker,
  condition,
  targetPrice,
  currentPrice,
  investmentsUrl,
}: SendInvestmentPriceAlertEmailProps) {
  const conditionText =
    condition === "above"
      ? "atingiu ou ultrapassou"
      : "atingiu ou ficou abaixo de";

  const emailHtml = `
    <!doctype html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Alerta de Preço - Groves Finanças</title>
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f4f4f5; }
        .email-container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        .header { text-align: center; padding: 40px; background: linear-gradient(135deg, #f0fdf4 0%, #edfcf5 100%); }
        .title { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0; }
        .content { padding: 32px 40px; }
        .message { font-size: 16px; line-height: 1.7; color: #4a4a4a; }
        .highlight { background: #f8fafc; border-left: 4px solid #18cb96; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0; }
        .button { display: inline-block; padding: 14px 32px; background: #18cb96; color: #fff !important; text-decoration: none; border-radius: 10px; font-weight: 600; }
        .footer { text-align: center; padding: 20px; font-size: 13px; color: #9ca3af; border-top: 1px solid #f0f0f0; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div style="font-size: 32px; margin-bottom: 8px;">📈</div>
          <h1 class="title">Alerta de preço atingido</h1>
        </div>
        <div class="content">
          <p class="message">Olá, ${name}!</p>
          <p class="message">
            O ativo <strong>${investmentName} (${ticker})</strong> ${conditionText}
            o preço alvo de <strong>${targetPrice}</strong>.
          </p>
          <div class="highlight">
            <p style="margin: 0;"><strong>Preço atual:</strong> ${currentPrice}</p>
            <p style="margin: 8px 0 0;"><strong>Preço alvo:</strong> ${targetPrice}</p>
          </div>
          <p style="text-align: center; margin: 32px 0;">
            <a href="${investmentsUrl}" class="button">Ver investimentos</a>
          </p>
        </div>
        <div class="footer">
          Groves Finanças — notificação automática de alerta de preço
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Groves Finanças" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Alerta: ${ticker} ${conditionText} ${targetPrice}`,
    html: emailHtml,
    text: `Olá, ${name}!\n\nO ativo ${investmentName} (${ticker}) ${conditionText} o preço alvo de ${targetPrice}.\nPreço atual: ${currentPrice}\n\nAcesse: ${investmentsUrl}`,
  });
}

interface DailySummaryAllocation {
  label: string;
  percentage: string;
  currentValue: string;
}

interface SendDailyInvestmentSummaryEmailProps {
  name: string;
  email: string;
  totalCurrentValue: string;
  totalInvested: string;
  totalProfit: string;
  totalProfitPercentage: string;
  allocationByType: DailySummaryAllocation[];
  investmentsUrl: string;
}

export async function sendDailyInvestmentSummaryEmail({
  name,
  email,
  totalCurrentValue,
  totalInvested,
  totalProfit,
  totalProfitPercentage,
  allocationByType,
  investmentsUrl,
}: SendDailyInvestmentSummaryEmailProps) {
  const allocationRows = allocationByType
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 0; color: #374151; font-size: 14px;">${item.label}</td>
          <td style="padding: 10px 0; color: #111827; font-size: 14px; text-align: right; font-weight: 600;">${item.percentage}%</td>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px; text-align: right;">${item.currentValue}</td>
        </tr>`,
    )
    .join("");

  const allocationText = allocationByType
    .map(
      (item) => `- ${item.label}: ${item.percentage}% (${item.currentValue})`,
    )
    .join("\n");

  const isProfitNegative = totalProfitPercentage.trim().startsWith("-");
  const profitPercentageColor = isProfitNegative ? "#dc2626" : "#059669";

  const emailHtml = `
    <!doctype html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Resumo da sua carteira</title>
    </head>
    <body style="margin: 0; padding: 24px; background: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
        <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">Bom dia,</p>
        <h1 style="margin: 0 0 24px; font-size: 22px; color: #111827; font-weight: 600;">Resumo da sua carteira</h1>
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #4b5563;">
          Olá, <strong>${name}</strong>! Aqui está o panorama da sua carteira nesta manhã.
        </p>

        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 12px; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em;">Resumo geral</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #374151;"><span style="color: #6b7280;">Valor atual total</span><br /><strong style="font-size: 20px; color: #111827;">${totalCurrentValue}</strong></p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #374151;"><span style="color: #6b7280;">Total investido</span><br /><strong>${totalInvested}</strong></p>
          <p style="margin: 0; font-size: 14px; color: #374151;"><span style="color: #6b7280;">Lucro / prejuízo</span><br /><strong>${totalProfit}</strong> <span style="color: ${profitPercentageColor};">(${totalProfitPercentage})</span></p>
        </div>

        <p style="margin: 0 0 12px; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em;">Por tipo de investimento</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
          <thead>
            <tr>
              <th style="padding: 0 0 8px; text-align: left; font-size: 12px; color: #9ca3af; font-weight: 500;">Tipo</th>
              <th style="padding: 0 0 8px; text-align: right; font-size: 12px; color: #9ca3af; font-weight: 500;">% </th>
              <th style="padding: 0 0 8px; text-align: right; font-size: 12px; color: #9ca3af; font-weight: 500;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${allocationRows}
          </tbody>
        </table>

        <p style="margin: 0; text-align: center;">
          <a href="${investmentsUrl}" style="display: inline-block; padding: 12px 24px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">Ver investimentos</a>
        </p>
      </div>
      <p style="max-width: 520px; margin: 16px auto 0; text-align: center; font-size: 12px; color: #9ca3af;">Groves Finanças — enviado automaticamente</p>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Groves Finanças" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Seu Panorama Financeiro",
    html: emailHtml,
    text: `Seu Panorama Financeiro

Olá, ${name}!

Valor atual total: ${totalCurrentValue}
Total investido: ${totalInvested}
Lucro/prejuízo: ${totalProfit} (${totalProfitPercentage})

Por tipo:
${allocationText}

Ver investimentos: ${investmentsUrl}`,
  });
}
