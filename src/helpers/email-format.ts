/**
 * Formata um e-mail para exibir apenas os primeiros 5 caracteres seguido de "..." e o domínio
 * @param email - E-mail completo
 * @returns E-mail formatado (ex: lucas...@gmail.com)
 */
export function formatEmail(email: string | undefined | null): string {
  if (!email) return "";

  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) return email;

  const firstFiveChars = localPart.slice(0, 5);

  return `${firstFiveChars}...@${domain}`;
}
