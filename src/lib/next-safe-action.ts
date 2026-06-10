import { headers } from "next/headers";
import { createSafeActionClient } from "next-safe-action";

import { auth } from "./auth";

export const actionClient = createSafeActionClient();

// middleware para verificar se o usuário está autenticado
export const protectedActionClient = createSafeActionClient().use(
  async ({ next }) => {
    // Obtém a sessão do usuário
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Verifica se o usuário está autenticado
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Se estiver autenticado, permite continuar com a ação e passa a sessão do usuário para o contexto
    return next({ ctx: { user: session.user } });
  },
);
