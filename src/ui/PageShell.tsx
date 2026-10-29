import type { ReactNode } from "react";
import type { AttributionPlacement } from "@/config";
import { Footer } from "./Footer";
import { Header } from "./Header";

// The centered 760px column shared by every page other than the game
export function PageShell({ children, placement = "footer" }: { children: ReactNode; placement?: AttributionPlacement }) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[760px] flex-col px-4">
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 pt-4 outline-none sm:pt-8">
        {children}
      </main>
      <Footer placement={placement} />
    </div>
  );
}
