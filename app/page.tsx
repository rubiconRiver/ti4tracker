import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold">TI4 Tracker</h1>
        <p className="text-gray-600">Twilight Imperium 4 turn and time tracker</p>

        <div className="space-y-4">
          <Link
            href="/game/new"
            className="block w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Create New Game
          </Link>
        </div>
      </div>
    </main>
  );
}
