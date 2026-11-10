"use client";

import { useEffect, useRef, useState } from "react";

// gold coin!
import coinSprite from "../../public/coin3_16x16.png";

// compact cars
import compactBlue from "../../public/cars/Compact/compact_blue.png";
import compactGreen from "../../public/cars/Compact/compact_green.png";
import compactOrange from "../../public/cars/Compact/compact_orange.png";
import compactRed from "../../public/cars/Compact/compact_red.png";

// Coupe cars
import coupeBlue from "../../public/cars/Coupe/coupe_blue.png";
import coupeGreen from "../../public/cars/Coupe/coupe_green.png";
import coupeMidnight from "../../public/cars/Coupe/coupe_midnight.png";
import coupeRed from "../../public/cars/Coupe/coupe_red.png";

// Sedan cars
import sedanBlue from "../../public/cars/Sedan/sedan_blue.png";
import sedanGray from "../../public/cars/Sedan/sedan_gray.png";
import sedanGreen from "../../public/cars/Sedan/sedan_green.png";
import sedanRed from "../../public/cars/Sedan/sedan_red.png";

// Sport cars
import sportBlue from "../../public/cars/Sport/sport_blue.png";
import sportGreen from "../../public/cars/Sport/sport_green.png";
import sportRed from "../../public/cars/Sport/sport_red.png";
import sportYellow from "../../public/cars/Sport/sport_yellow.png";

export default function Main() {
  type GameScreen = "start" | "playing" | "gameover";
  const [gameScreen, setGameScreen] = useState<GameScreen>("start");
  const [score, setScore] = useState(0);
  const [survivalTime, setSurvivalTime] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (gameScreen !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let isGameOver = false;

    // Game Variables
    let localScore = 0;
    let speed = 5;
    let frameCount = 0;
    let bgY = 0;
    let startTime = Date.now();
    
    // Lane configuration (3 lanes)
    let currentLane = 1; // 0 = Left, 1 = Middle, 2 = Right
    const laneWidth = canvas.width / 3;
    const laneCenters = [laneWidth / 2, laneWidth * 1.5, laneWidth * 2.5];

    // 1. Load the player car image
    const playerImg = new Image();
    playerImg.src = compactGreen.src; 

    // 2. Define player state
    const player = {
      width: 40,
      height: 80,
      x: laneCenters[1] - 20, 
      y: canvas.height - 120,   
    };

    // 3. Load Obstacles
    const enemySrcs = [
      compactBlue.src, compactRed.src, compactOrange.src,
      coupeMidnight.src, coupeRed.src, sedanGray.src, 
      sportBlue.src, sportYellow.src
    ];
    
    const enemyImages = enemySrcs.map(src => {
        const img = new Image();
        img.src = src;
        return img;
    });

    const enemies: any[] = [];

    // Helper to move player safely within lanes
    const movePlayer = (direction: number) => {
        const newLane = currentLane + direction;
        if (newLane >= 0 && newLane < 3) {
            currentLane = newLane;
        }
    };

    // Controls: Keyboard
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
            movePlayer(-1);
        } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
            movePlayer(1);
        }
    };

    // Controls: Touch/Mouse (50/50 split screen)
    const handleInteraction = (e: MouseEvent | TouchEvent) => {
        e.preventDefault(); // Stop mobile devices from firing both touch and mouse events
        
        const rect = canvas.getBoundingClientRect();
        let clientX = 0;
        
        if (e instanceof TouchEvent) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = (e as MouseEvent).clientX;
        }
        
        const clickX = clientX - rect.left;
        
        // Check if tapped left half or right half of the actual screen width
        if (clickX < rect.width / 2) {
            movePlayer(-1);
        } else {
            movePlayer(1);
        }
    };

    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("mousedown", handleInteraction);
    canvas.addEventListener("touchstart", handleInteraction, { passive: false });

    // Ensure initial UI reset
    const scoreEl = document.getElementById("scoreDisplay");
    const speedEl = document.getElementById("speedDisplay");
    if (scoreEl) scoreEl.innerText = "0";
    if (speedEl) speedEl.innerText = "1.0x";

    const spawnEnemy = () => {
        const lane = Math.floor(Math.random() * 3);
        const img = enemyImages[Math.floor(Math.random() * enemyImages.length)];
        enemies.push({
            x: laneCenters[lane] - 20,
            y: -100, // Spawn above canvas
            width: 40,
            height: 80,
            img: img,
            passed: false
        });
    };

    const gameLoop = () => {
        if (isGameOver) return;

        // Clear Canvas & Draw Background
        ctx.fillStyle = "#1e293b"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw animated lane dividers
        bgY = (bgY + speed) % 100;
        ctx.strokeStyle = "#475569"; 
        ctx.lineWidth = 4;
        ctx.setLineDash([30, 20]);
        ctx.beginPath();
        
        // Line between lane 0 and 1
        ctx.moveTo(laneWidth, bgY - 100); 
        ctx.lineTo(laneWidth, canvas.height);
        
        // Line between lane 1 and 2
        ctx.moveTo(laneWidth * 2, bgY - 100); 
        ctx.lineTo(laneWidth * 2, canvas.height);
        
        ctx.stroke();
        ctx.setLineDash([]); // Reset

        // Update & Draw Player (Smooth interpolation to target lane - matching your 0.3 lerp factor)
        const targetX = laneCenters[currentLane] - player.width / 2;
        player.x += (targetX - player.x) * 0.3; 

        if (playerImg.complete) {
            ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
        }

        // Spawn Enemies (Dynamic rate based on speed)
        const spawnRate = Math.max(30, 90 - Math.floor(speed * 4));
        if (frameCount % spawnRate === 0) {
            spawnEnemy();
        }

        // Update & Draw Enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            e.y += speed;

            if (e.img.complete) {
                ctx.drawImage(e.img, e.x, e.y, e.width, e.height);
            }

            // Check Collision (AABB)
            const collisionTolerance = 5; 
            if (
                player.x + collisionTolerance < e.x + e.width - collisionTolerance &&
                player.x + player.width - collisionTolerance > e.x + collisionTolerance &&
                player.y + collisionTolerance < e.y + e.height - collisionTolerance &&
                player.height + player.y - collisionTolerance > e.y + collisionTolerance
            ) {
                isGameOver = true;
                const endTime = Math.floor((Date.now() - startTime) / 1000);
                setScore(localScore);
                setSurvivalTime(endTime);
                setGameScreen("gameover");
                break;
            }

            // Update Score & Difficulty
            if (e.y > player.y + player.height && !e.passed) {
                e.passed = true;
                localScore += 10;
                
                if (scoreEl) scoreEl.innerText = localScore.toString();

                if (localScore % 50 === 0) {
                    speed += 0.5;
                    if (speedEl) speedEl.innerText = (speed / 5).toFixed(1) + "x";
                }
            }

            // Remove off-screen enemies
            if (e.y > canvas.height) {
                enemies.splice(i, 1);
            }
        }

        frameCount++;
        animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener("keydown", handleKeyDown);
        canvas.removeEventListener("mousedown", handleInteraction);
        canvas.removeEventListener("touchstart", handleInteraction);
    };
  }, [gameScreen]);
    
  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 text-white overflow-hidden touch-none overscroll-none">
      
      <div id="game-container" className="sm:rounded-xl relative shadow-2xl shadow-black">
        <canvas
            ref={canvasRef}
            id="gameCanvas"
            width={450}
            height={800}
            className="bg-slate-900 block sm:rounded-xl"
        />

        {/* Start Screen */}
        <div
            id="startScreen"
            className={`absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm z-20 transition-opacity duration-300 sm:rounded-xl ${
                gameScreen === "start" ? "" : "hidden"}`}
        >
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 mb-2 drop-shadow-lg text-center">
              CARS RUNNER</h1>
            <p className="text-slate-400 mb-8 text-center px-6">
                Race through traffic, dodge incoming cars, and survive as long as you can!<br/><br/>
                <span className="text-sm font-semibold text-slate-300">Controls: Arrow Keys or Tap Left/Right Screen</span>
            </p>
            <button id="startBtn" onClick={() => setGameScreen("playing")}
 className="px-8 py-3 text-slate-900 bg-green-500 hover:bg-green-400 font-bold rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all transform hover:scale-105 active:scale-95 text-lg">
                PLAY NOW
            </button>
        </div>
        
        {/* Score display */}
        <div id="scoreUI" className={`absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none ${
                gameScreen === "playing" ? "" : "hidden"}`}>
            <div className="bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm border border-slate-600">
                <span className="text-slate-300 text-sm font-semibold uppercase tracking-wider">Score</span><br/>
                <span id="scoreDisplay" className="text-2xl font-bold font-mono text-cyan-400">0</span>
            </div>
            <div className="bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm border border-slate-600 text-right">
                <span className="text-slate-300 text-sm font-semibold uppercase tracking-wider">Speed</span><br/>
                <span id="speedDisplay" className="text-xl font-bold font-mono text-yellow-400">1.0x</span>
            </div>
        </div>

        {/* Game over screen */}
          <div
              id="gameOverScreen"
              className={`absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md z-30 sm:rounded-xl ${
                  gameScreen === "gameover" ? "" : "hidden"
              }`}
          >
            <h2 className="text-4xl font-extrabold text-red-500 mb-2 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">CAR CRASH</h2>
            <div className="text-center mb-8 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 w-3/4">
                <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">Final Score</p>
                <p id="finalScoreDisplay" className="text-5xl font-mono font-bold text-green-400 mb-4">{score}</p>
                <p className="text-slate-500 text-xs">Survived for <span id="survivalTimeDisplay" className="text-slate-300 font-bold">{survivalTime}</span> seconds</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-4">
              <button
                  id="restartBtn"
                  onClick={() => setGameScreen("playing")}
                  className="px-8 py-3 bg-green-500 hover:bg-green-400 text-slate-900 font-bold rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all transform hover:scale-105 active:scale-95 text-lg w-full"
              >
                  PLAY AGAIN
              </button>
              <button
                  id="mainMenuBtn"
                  onClick={() => setGameScreen("start")}
                  className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-full transition-all transform hover:scale-105 active:scale-95 text-lg w-full"
              >
                  MAIN MENU
              </button>
            </div>
        </div>
      </div>
    </main>
  );
}