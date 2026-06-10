/**
 * Extrai as duas primeiras iniciais do nome completo do usuário
 * @param fullName - Nome completo do usuário
 * @returns String com as duas primeiras iniciais em maiúsculo
 *
 * @example
 * getUserInitials("Bill Gates") // retorna "BG"
 * getUserInitials("João Silva Santos") // retorna "JS"
 * getUserInitials("Maria") // retorna "M"
 * getUserInitials("") // retorna ""
 */
export function getUserInitials(fullName?: string): string {
  if (!fullName || typeof fullName !== "string") {
    return "";
  }

  const names = fullName
    .trim()
    .split(" ")
    .filter((name) => name.length > 0);

  if (names.length === 0) {
    return "";
  }

  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }

  // Pega a primeira letra do primeiro nome e a primeira letra do segundo nome
  const firstInitial = names[0].charAt(0).toUpperCase();
  const secondInitial = names[1].charAt(0).toUpperCase();

  return firstInitial + secondInitial;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const getFirstAndLastName = (fullName?: string) => {
  if (!fullName) return "";
  const nameParts = fullName.trim().split(" ");
  if (nameParts.length === 1) return nameParts[0];
  return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
};
