"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles, RotateCcw, Trophy, Volume2, VolumeX } from "lucide-react"
import confetti from "canvas-confetti"

type Player = "X" | "O" | null
type BoardState = Player[]

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

// Disco colors
const discoColors = [
  "#FF3366", // Pink
  "#33CCFF", // Blue
  "#FFCC33", // Yellow
  "#33FF99", // Green
  "#CC33FF", // Purple
  "#FF6633", // Orange
]

export default function TicTacToe() {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X")
  const [winner, setWinner] = useState<Player>(null)
  const [winningCombo, setWinningCombo] = useState<number[] | null>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [discoMode, setDiscoMode] = useState(true)
  const [scoreX, setScoreX] = useState(0)
  const [scoreO, setScoreO] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [audioInitialized, setAudioInitialized] = useState(false)
  const discoBallRef = useRef<HTMLDivElement>(null)

  // Use a simpler approach for sound effects
  const playClickSound = () => {
    if (soundEnabled && audioInitialized) {
      // Create a temporary audio element for this specific sound
      const audio = new Audio("/click.mp3")
      audio.volume = 0.5
      audio.play().catch((e) => {
        console.log("Sound playback prevented by browser")
      })
    }
  }

  const playMoveSound = (player: "X" | "O") => {
    if (soundEnabled && audioInitialized) {
      // Create a temporary audio element with different pitch for X and O
      const audio = new Audio("/move.mp3")
      audio.volume = 0.4
      audio.playbackRate = player === "X" ? 1.2 : 0.8
      audio.play().catch((e) => {
        console.log("Sound playback prevented by browser")
      })
    }
  }

  const playWinSound = () => {
    if (soundEnabled && audioInitialized) {
      const audio = new Audio("/win.mp3")
      audio.volume = 0.6
      audio.play().catch((e) => {
        console.log("Sound playback prevented by browser")
      })
    }
  }

  // Initialize audio on first user interaction
  const initializeAudio = () => {
    if (!audioInitialized) {
      setAudioInitialized(true)

      // Create and immediately suspend a silent audio context
      // This primes the audio system on some browsers
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        if (AudioContext) {
          const audioCtx = new AudioContext()
          const silence = audioCtx.createBuffer(1, 1, 22050)
          const source = audioCtx.createBufferSource()
          source.buffer = silence
          source.connect(audioCtx.destination)
          source.start()
        }
      } catch (e) {
        console.log("Audio context initialization failed", e)
      }
    }
  }

  useEffect(() => {
    if (winner && audioInitialized) {
      // Play win sound
      playWinSound()

      // Update scores
      if (winner === "X") {
        setScoreX((prev) => prev + 1)
      } else if (winner === "O") {
        setScoreO((prev) => prev + 1)
      }

      // Trigger disco confetti when there's a winner
      const confettiInterval = setInterval(() => {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: discoColors,
        })
      }, 300)

      // Rotate the disco ball
      if (discoBallRef.current) {
        discoBallRef.current.style.display = "block"
      }

      return () => clearInterval(confettiInterval)
    }
  }, [winner, audioInitialized])

  const checkWinner = (boardState: BoardState): [Player, number[] | null] => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return [boardState[a], combo]
      }
    }
    return [null, null]
  }

  const checkDraw = (boardState: BoardState): boolean => {
    return boardState.every((square) => square !== null)
  }

  const handleClick = (index: number) => {
    // Initialize audio system on first interaction
    if (!audioInitialized) {
      initializeAudio()
    }

    if (board[index] || winner || isDraw) return

    // Play sound based on current player
    playMoveSound(currentPlayer)

    setGameStarted(true)
    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    const [newWinner, combo] = checkWinner(newBoard)
    if (newWinner) {
      setWinner(newWinner)
      setWinningCombo(combo)
      return
    }

    if (checkDraw(newBoard)) {
      setIsDraw(true)
      return
    }

    setCurrentPlayer(currentPlayer === "X" ? "O" : "X")
  }

  const resetGame = () => {
    // Initialize audio system if not already
    if (!audioInitialized) {
      initializeAudio()
    }

    playClickSound()

    setBoard(Array(9).fill(null))
    setCurrentPlayer("X")
    setWinner(null)
    setWinningCombo(null)
    setIsDraw(false)
    setGameStarted(false)

    if (discoBallRef.current) {
      discoBallRef.current.style.display = "none"
    }
  }

  const resetScores = () => {
    // Initialize audio system if not already
    if (!audioInitialized) {
      initializeAudio()
    }

    playClickSound()

    setScoreX(0)
    setScoreO(0)
    resetGame()
  }

  const toggleSound = () => {
    // Initialize audio system if not already
    if (!audioInitialized) {
      initializeAudio()
    }

    setSoundEnabled(!soundEnabled)

    // Play button sound if enabling sound
    if (!soundEnabled) {
      setTimeout(() => {
        playClickSound()
      }, 100)
    }
  }

  const getStatus = () => {
    if (winner) {
      return `Player ${winner} wins!`
    } else if (isDraw) {
      return "It's a draw!"
    } else {
      return `Player ${currentPlayer}'s turn`
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Sound toggle button */}
      <motion.div className="absolute top-4 right-4 z-30" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSound}
          className="bg-black/40 border-white/30 text-white hover:bg-black/60 hover:text-white"
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
      </motion.div>

      {/* Score Board */}
      <div className="w-full max-w-md mb-6 p-4 bg-black/40 backdrop-blur-md rounded-xl border-2 border-white/30">
        <h3 className="text-xl font-bold text-center text-white mb-3">Score Board</h3>
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center p-3 bg-pink-600/50 rounded-lg border border-pink-300/50 w-1/2 mr-2">
            <div className="text-3xl font-bold text-white mb-1">X</div>
            <div className="flex items-center">
              <Trophy className="w-4 h-4 text-yellow-300 mr-1" />
              <span className="text-2xl font-bold text-white">{scoreX}</span>
            </div>
          </div>
          <div className="flex flex-col items-center p-3 bg-cyan-600/50 rounded-lg border border-cyan-300/50 w-1/2 ml-2">
            <div className="text-3xl font-bold text-white mb-1">O</div>
            <div className="flex items-center">
              <Trophy className="w-4 h-4 text-yellow-300 mr-1" />
              <span className="text-2xl font-bold text-white">{scoreO}</span>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-2xl font-bold text-center text-white bg-black/30 px-6 py-2 rounded-full border border-white/30"
      >
        {getStatus()}
      </motion.div>

      {/* Disco ball */}
      <div ref={discoBallRef} className="disco-ball" style={{ display: "none" }}></div>

      <motion.div
        className="grid grid-cols-3 gap-3 mb-8 relative p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/20"
        animate={{
          boxShadow: discoMode
            ? [
                "0 0 10px #FF3366",
                "0 0 20px #33CCFF",
                "0 0 10px #FFCC33",
                "0 0 20px #33FF99",
                "0 0 10px #CC33FF",
                "0 0 20px #FF6633",
                "0 0 10px #FF3366",
              ]
            : "none",
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      >
        {board.map((value, index) => (
          <Square
            key={index}
            value={value}
            onClick={() => handleClick(index)}
            isWinning={winningCombo?.includes(index) || false}
            gameStarted={gameStarted}
            discoMode={discoMode}
          />
        ))}
      </motion.div>

      <div className="flex gap-4">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={resetGame}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 border-2 border-white shadow-lg text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={resetScores}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 border-2 border-white shadow-lg text-white"
          >
            Reset Scores
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

interface SquareProps {
  value: Player
  onClick: () => void
  isWinning: boolean
  gameStarted: boolean
  discoMode: boolean
}

function Square({ value, onClick, isWinning, gameStarted, discoMode }: SquareProps) {
  return (
    <motion.div
      initial={gameStarted ? { scale: 0.8, opacity: 0 } : { scale: 1, opacity: 1 }}
      animate={{
        scale: 1,
        opacity: 1,
        boxShadow: isWinning
          ? [
              `0 0 10px ${discoColors[0]}`,
              `0 0 20px ${discoColors[1]}`,
              `0 0 10px ${discoColors[2]}`,
              `0 0 20px ${discoColors[3]}`,
              `0 0 10px ${discoColors[4]}`,
              `0 0 20px ${discoColors[5]}`,
              `0 0 10px ${discoColors[0]}`,
            ]
          : discoMode
            ? [
                "0 0 5px rgba(255, 255, 255, 0.5)",
                "0 0 10px rgba(255, 255, 255, 0.3)",
                "0 0 5px rgba(255, 255, 255, 0.5)",
              ]
            : "none",
      }}
      transition={{
        duration: isWinning ? 1 : 0.5,
        repeat: isWinning ? Number.POSITIVE_INFINITY : 0,
        repeatType: "reverse",
      }}
      whileHover={!value ? { scale: 1.05, rotate: 5 } : {}}
      whileTap={!value ? { scale: 0.95 } : {}}
      className={`w-24 h-24 flex items-center justify-center text-4xl font-bold rounded-lg cursor-pointer ${
        isWinning
          ? "bg-gradient-to-r from-green-400/80 to-blue-500/80 border-2 border-white"
          : value
            ? "bg-black/40 border-2 border-white/50"
            : "bg-white/20 hover:bg-white/30 border-2 border-white/30"
      }`}
      onClick={onClick}
    >
      <AnimatePresence mode="wait">
        {value && (
          <motion.div
            key={value}
            initial={{ scale: 0, rotate: -180 }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: 0,
            }}
            transition={{
              scale: {
                repeat: isWinning ? Number.POSITIVE_INFINITY : 0,
                duration: 1,
                repeatType: "reverse",
              },
              rotate: { duration: 0.5 },
            }}
            exit={{ scale: 0, rotate: 180 }}
            className={`${value === "X" ? "text-pink-300" : "text-cyan-300"} disco-text-glow`}
          >
            {value === "X" ? (
              <div className="relative">
                X
                {isWinning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    className="absolute -top-1 -right-2"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="relative">
                O
                {isWinning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    className="absolute -top-1 -right-2"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
