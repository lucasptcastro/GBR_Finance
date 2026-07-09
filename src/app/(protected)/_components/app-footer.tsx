import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t">
      <div className="flex items-center justify-center gap-2">
        <Link href="https://wa.me/5584996290129" target="_blank">
          <Image
            className="dark:hidden"
            src="/logotipo-terrabit-verde-preto.png"
            alt="Terra-Bit"
            width={120}
            height={24}
          />
        </Link>

        <Link href="https://wa.me/5584996290129" target="_blank">
          <Image
            className="hidden dark:block"
            src="/logotipo-terrabit-verde-branco.png"
            alt="Terra-Bit"
            width={120}
            height={24}
          />
        </Link>
        <X className="text-muted-foreground h-4 w-4" />

        <Link href="https://wa.me/5584991649669" target="_blank">
          <Image
            className="-mt-1.5 dark:hidden"
            src="/logotipo-groves-verde-preto.svg"
            alt="Grove Solutions"
            width={120}
            height={24}
          />
        </Link>
        <Link href="https://wa.me/5584991649669" target="_blank">
          <Image
            className="hidden dark:block"
            src="/logotipo-groves-verde-branco.svg"
            alt="Grove Solutions"
            width={120}
            height={24}
          />
        </Link>
      </div>
    </footer>
  );
}
