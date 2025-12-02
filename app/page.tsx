import Link from "next/link";
import { Button } from "@/components/ui";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo/Title */}
        <div className="space-y-4">
          <div className="text-6xl">🌌</div>
          <h1 className="text-5xl font-bold text-white">TI4 Tracker</h1>
          <p className="text-gray-400 text-lg">
            Twilight Imperium 4 turn and time tracker
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 py-8">
          <div className="text-center">
            <div className="text-2xl mb-2">⏱️</div>
            <div className="text-sm text-gray-400">Turn Timer</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm text-gray-400">Score Tracking</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📱</div>
            <div className="text-sm text-gray-400">Mobile Ready</div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Link href="/game/new">
            <Button
              variant="primary"
              size="xl"
              fullWidth
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Create New Game
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-600 pt-8">
          Perfect for TV displays and mobile turn tracking
        </p>
      </div>
    </main>
  );
}
