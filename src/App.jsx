import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion";
import { Users, Coins, Shield, Cross } from "lucide-react";
import { CARD_DATA, DEATH_MESSAGES } from "./gameData";
import "./App.css";

function App() {
  const [stats, setStats] = useState({ population: 50, treasury: 50, army: 50, religion: 50 });
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [deathReason, setDeathReason] = useState("");
  const [year, setYear] = useState(1);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  // Indicator dots
  const leftIndicatorOpacity = useTransform(x, [-50, -150], [0, 1]);
  const rightIndicatorOpacity = useTransform(x, [50, 150], [0, 1]);

  const currentCard = CARD_DATA[currentCardIndex];

  // Check Game Over conditions
  useEffect(() => {
    if (gameOver) return;

    for (const [stat, value] of Object.entries(stats)) {
      if (value <= 0) {
        setDeathReason(DEATH_MESSAGES[`${stat}_low`]);
        setGameOver(true);
        return;
      }
      if (value >= 100) {
        setDeathReason(DEATH_MESSAGES[`${stat}_high`]);
        setGameOver(true);
        return;
      }
    }
  }, [stats]);

  const handleSwipe = (direction) => {
    const effect = direction === "left" ? currentCard.leftEffect : currentCard.rightEffect;
    const nextId = direction === "left" ? currentCard.leftNext : currentCard.rightNext;

    // Apply Stats
    setStats((prev) => ({
      population: Math.max(0, Math.min(100, prev.population + effect.population)),
      treasury: Math.max(0, Math.min(100, prev.treasury + effect.treasury)),
      army: Math.max(0, Math.min(100, prev.army + effect.army)),
      religion: Math.max(0, Math.min(100, prev.religion + effect.religion)),
    }));

    setYear((prev) => prev + 1);

    if (nextId === "random") {
      const randomIndex = Math.floor(Math.random() * CARD_DATA.length);
      setCurrentCardIndex(randomIndex);
    } else {
      const nextIndex = CARD_DATA.findIndex((c) => c.id === nextId);
      setCurrentCardIndex(nextIndex !== -1 ? nextIndex : Math.floor(Math.random() * CARD_DATA.length));
    }
    
    x.set(0); // Reset position
  };

  const restartGame = () => {
    setStats({ population: 50, treasury: 50, army: 50, religion: 50 });
    setCurrentCardIndex(0);
    setYear(1);
    setGameOver(false);
    setDeathReason("");
  };

  const StatIcon = ({ icon: Icon, value, color }) => (
    <div className="stat-container">
      <Icon size={24} color={color} />
      <div className="stat-bar-bg">
        <div className="stat-bar-fill" style={{ width: `${value}%`, backgroundColor: color }}></div>
      </div>
    </div>
  );

  return (
    <div className="game-container">
      <header className="header">
        <h1>Year {year}</h1>
      </header>

      <div className="stats-row">
        <StatIcon icon={Users} value={stats.population} color="#3b82f6" />
        <StatIcon icon={Coins} value={stats.treasury} color="#f59e0b" />
        <StatIcon icon={Shield} value={stats.army} color="#ef4444" />
        <StatIcon icon={Cross} value={stats.religion} color="#a855f7" />
      </div>

      <div className="card-area">
        {!gameOver ? (
          <motion.div
            className="swipe-card"
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.x;
              if (swipe < -100) {
                handleSwipe("left");
              } else if (swipe > 100) {
                handleSwipe("right");
              } else {
                x.set(0); // bounce back
              }
            }}
          >
            <div className="card-image-placeholder">
              <div className="character-avatar">{currentCard.character[0]}</div>
            </div>
            
            <div className="card-content">
              <h2>{currentCard.character}</h2>
              <p className="role">{currentCard.role}</p>
              <p className="dialogue">"{currentCard.text}"</p>
            </div>

            {/* Swipe Indicators */}
            <motion.div className="swipe-indicator left" style={{ opacity: leftIndicatorOpacity }}>
              {currentCard.leftChoice}
            </motion.div>
            <motion.div className="swipe-indicator right" style={{ opacity: rightIndicatorOpacity }}>
              {currentCard.rightChoice}
            </motion.div>

          </motion.div>
        ) : (
          <div className="game-over-card">
            <h2>Your Reign has Ended</h2>
            <p>You survived for {year} years.</p>
            <p className="death-reason">{deathReason}</p>
            <button onClick={restartGame} className="restart-btn">Rule Again</button>
          </div>
        )}
      </div>

      <div className="instructions">
        <p>Swipe Left or Right to make a decision.</p>
        <p>Balance the 4 pillars of the kingdom. If any reach 0 or 100, you die.</p>
      </div>
    </div>
  );
}

export default App;
