import { Footer } from "@/ui/Footer";
import { Game } from "@/ui/Game";

// A static shell, prerendered at build time; the game itself asks /api/today what to show
export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[760px] flex-col px-4">
      <Game />
      <Footer />
    </div>
  );
}
