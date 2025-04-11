import TicTacToe from "@/components/tic-tac-toe"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="disco-background absolute inset-0 z-0"></div>
      <div className="disco-overlay absolute inset-0 z-10"></div>
      <div className="relative z-20 flex flex-col items-center w-full max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-6 text-white disco-text">Disco Tic-Tac-Toe</h1>
        <h2 className="text-xl font-medium text-center mb-8 text-white">Two Player Party Game</h2>
        <TicTacToe />
      </div>
    </main>
  )
}
