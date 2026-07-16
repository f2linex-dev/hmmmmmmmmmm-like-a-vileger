import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine, SOUND_PRESETS } from './SoundEngine';
import { HmmType } from '../types';
import { Sun, Moon, Sparkles, Volume2, HelpCircle } from 'lucide-react';

interface EmeraldParticle {
  id: number;
  x: number;
  y: number;
}

export default function VillagePreview() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [clicks, setClicks] = useState<number>(0);
  const [activePreset, setActivePreset] = useState<HmmType>('ambient');
  const [dialogue, setDialogue] = useState<string>('Tap my nose... I dare you.');
  const [particles, setParticles] = useState<EmeraldParticle[]>([]);
  const [particleIdCounter, setParticleIdCounter] = useState<number>(0);

  // Background image paths from generated assets
  const daytimeBg = '/src/assets/images/village_daytime_pixelart_1784233922750.jpg';
  const nighttimeBg = '/src/assets/images/village_nighttime_pixelart_1784233939771.jpg';

  const villagerQuotes: { [key in HmmType]: string[] } = {
    ambient: [
      "Hmm...",
      "Hrrrm.",
      "Hmm? Nice day isn't it?",
      "Hmhmm. Just standing here.",
      "Hrrmm. Beautiful pixel weather."
    ],
    trade: [
      "Hmm? What do you offer?",
      "Hrrmm. Emeralds, please!",
      "Hmrrm? Is that wheat?",
      "Hmm. 24 Paper for 1 Emerald?",
      "Hmhmm. Look at my trades!"
    ],
    disagree: [
      "Hrrmmm! No way.",
      "Hphm! Too expensive.",
      "Hrrm. Come back later.",
      "Hmph! That is a terrible deal.",
      "Hrrmmm. Not enough emeralds."
    ],
    yes: [
      "Hm-hmm! Splendid!",
      "Hmhmm! Deal closed!",
      "Hmm! I accept!",
      "Hrr-hm! Thank you, adventurer!",
      "Hm-hmm! Emerald earned!"
    ],
    no: [
      "Hreh! Stop.",
      "Hrh! Out.",
      "Hreh! Bad offer.",
      "Hreh! No trade.",
      "Hreh! Moving on."
    ]
  };

  const handleNoseClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 1. Play synthesized sound effect
    soundEngine.play(activePreset);

    // 2. Increment counters
    setClicks(prev => prev + 1);

    // 3. Trigger random quote from current sound preset category
    const quotes = villagerQuotes[activePreset];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setDialogue(randomQuote);

    // 4. Spawn a blocky emerald particle at click position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newParticle: EmeraldParticle = {
      id: particleIdCounter,
      x,
      y
    };
    
    setParticles(prev => [...prev, newParticle]);
    setParticleIdCounter(prev => prev + 1);

    // Remove particle after animation ends
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1200);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch h-full w-full">
      
      {/* Simulation Box */}
      <div className="flex-1 flex flex-col items-center justify-between p-6 relative overflow-hidden border-8 border-white bg-black aspect-[9/16] lg:aspect-auto lg:h-[650px] shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]" id="simulation-viewport">
        
        {/* Clean Minimalism Pure-CSS Voxel Scenery Backdrop */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden" style={{ backgroundColor: isDarkMode ? '#111827' : '#7297ff' }}>
          
          {/* Sun or Moon with solid black outlines */}
          {!isDarkMode ? (
            <div className="absolute top-12 right-12 w-16 h-16 bg-[#ffff00] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)]" />
          ) : (
            <div className="absolute top-12 right-12 w-14 h-14 bg-[#e5e7eb] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)] flex p-1.5 justify-end">
              <div className="w-5 h-5 bg-zinc-400 rounded-sm opacity-40" />
            </div>
          )}

          {/* Clouds / Stars */}
          {!isDarkMode ? (
            <>
              {/* Cloud 1 */}
              <div className="absolute top-16 left-[10%] w-24 h-8 bg-white border-4 border-black" />
              <div className="absolute top-10 left-[14%] w-12 h-6 bg-white border-t-4 border-l-4 border-r-4 border-black" />
              {/* Cloud 2 */}
              <div className="absolute top-24 left-[55%] w-32 h-10 bg-white border-4 border-black" />
              <div className="absolute top-16 left-[62%] w-16 h-8 bg-white border-t-4 border-l-4 border-r-4 border-black" />
            </>
          ) : (
            <>
              {/* Stars */}
              <div className="absolute top-16 left-[15%] w-2.5 h-2.5 bg-yellow-200" />
              <div className="absolute top-32 left-[40%] w-3.5 h-3.5 bg-yellow-200 rotate-45" />
              <div className="absolute top-20 left-[75%] w-2.5 h-2.5 bg-yellow-200" />
              <div className="absolute top-48 left-[25%] w-3 h-3 bg-yellow-100 rotate-12" />
            </>
          )}

          {/* Ground (Grass layers with solid borders) */}
          <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-[#55aa33] border-t-8 border-[#3d7a24] flex flex-col justify-end">
            <div className="h-6 bg-[#8b7355] border-t-4 border-black" />
          </div>

          {/* Minimal Voxel House on the left */}
          <div className="absolute bottom-[35%] left-[6%] w-32 h-32 flex flex-col items-stretch z-0">
            {/* Roof */}
            <div className="h-8 bg-[#3d2a22] border-4 border-black relative" />
            {/* Walls */}
            <div className="flex-1 bg-[#5c4033] border-l-4 border-r-4 border-b-4 border-black p-2 relative flex items-center justify-start">
              {/* Window */}
              <div className="w-8 h-10 bg-[#87ceeb] border-4 border-white flex flex-col justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                <div className="h-[2px] bg-white w-full" />
                <div className="h-full w-[2px] bg-white mx-auto" />
              </div>
              {/* Door */}
              <div className="absolute bottom-0 right-2 w-7 h-14 bg-[#3d2a22] border-t-4 border-l-4 border-r-4 border-black" />
            </div>
          </div>

          {/* Minimal Voxel House on the right */}
          <div className="absolute bottom-[35%] right-[5%] w-24 h-24 flex flex-col items-stretch z-0">
            {/* Roof */}
            <div className="h-6 bg-[#3d2a22] border-4 border-black" />
            {/* Walls */}
            <div className="flex-1 bg-[#5c4033] border-l-4 border-r-4 border-b-4 border-black flex items-center justify-center">
              <div className="w-6 h-8 bg-[#87ceeb] border-2 border-white" />
            </div>
          </div>

          {/* Path in the middle */}
          <div className="absolute bottom-0 left-[38%] right-[38%] h-[35%] bg-[#8b7355] border-l-4 border-r-4 border-black shadow-[inset_0_8px_0_rgba(0,0,0,0.15)] z-0" />

          {/* Overlay grid for voxel layout */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px]" />
        </div>

        {/* Top Header / Action Bar */}
        <div className="w-full flex items-center justify-between z-10">
          {/* Villager Badge with high contrast outline */}
          <div className="bg-black/90 border-4 border-white px-4 py-2 flex items-center gap-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
            <span className="text-lg">🧑🌾</span>
            <div className="flex flex-col">
              <span className="font-courier text-[9px] font-bold text-zinc-400 leading-none uppercase tracking-wider">MOB LEVEL</span>
              <span className="font-courier font-bold text-xs text-white leading-tight uppercase tracking-wider">VILLAGER #182</span>
            </div>
          </div>

          {/* Day/Night Theme Switcher (Flat outline button) */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="px-4 py-2.5 bg-black border-4 border-white hover:bg-zinc-900 active:translate-y-0.5 text-white transition cursor-pointer flex items-center gap-2 font-courier font-bold text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
            title="Toggle Day/Night Village Mode"
          >
            {isDarkMode ? (
              <>
                <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                <span>NIGHT</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400 animate-spin-slow" />
                <span>DAY</span>
              </>
            )}
          </button>
        </div>

        {/* Midsection: Speech Bubble and Interactive Nose */}
        <div className="flex flex-col items-center justify-center flex-1 w-full gap-8 z-10 my-4">
          
          {/* Villager Dialog Balloon - Minimal White Outlined Card */}
          <motion.div
            initial={{ y: 5 }}
            animate={{ y: -5 }}
            transition={{
              repeat: Infinity,
              repeatType: 'reverse',
              duration: 2,
              ease: 'easeInOut'
            }}
            className="relative max-w-[260px] text-center z-20"
          >
            {/* Clean Minimalism style card */}
            <div className="minimal-title-card py-3.5 px-5">
              <p className="font-courier font-bold text-xs text-white leading-relaxed uppercase tracking-wide">
                {dialogue}
              </p>
            </div>

            {/* Bubble arrow tip with flat border */}
            <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-black border-b-4 border-r-4 border-white rotate-45 z-10" />
          </motion.div>

          {/* Interactive Nose Container */}
          <div className="relative">
            {/* Instruction hint banner - Minimalist Pill style */}
            <div className="absolute top-[-32px] left-1/2 -translate-x-1/2 w-max minimal-hint-pill py-1.5 px-3 flex items-center gap-1.5 select-none pointer-events-none animate-pulse">
              <Volume2 className="w-3.5 h-3.5" /> <span>CLICK NOSE TO HMM</span>
            </div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.85, y: 15 }}
              onClick={handleNoseClick}
              className="relative w-36 h-56 cursor-pointer select-none"
            >
              {/* Particle Render Frame */}
              <AnimatePresence>
                {particles.map(p => (
                  <motion.div
                    key={p.id}
                    className="absolute z-50 pointer-events-none font-courier text-lg font-bold"
                    initial={{ opacity: 1, x: p.x - 10, y: p.y - 10, scale: 0.8 }}
                    animate={{ 
                      opacity: 0, 
                      y: p.y - 160, 
                      x: p.x + (Math.random() * 80 - 40), 
                      scale: 1.3,
                      rotate: Math.random() * 360 
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  >
                    <span className="text-emerald-400 drop-shadow-[0_2px_0_rgba(0,0,0,1)]">🟢</span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Pixel Art Nose drawn with layered SVGs with crisp solid block shadow */}
              <svg 
                viewBox="0 0 100 150" 
                className="w-full h-full drop-shadow-[8px_8px_0px_rgba(0,0,0,0.45)]"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outermost border */}
                <rect x="0" y="0" width="100" height="150" fill="#2d1d13" />

                {/* Main Body block */}
                <rect x="6" y="6" width="88" height="138" fill="#bc8060" />

                {/* Left and Top Highlight (for 3D voxel edge look) */}
                <rect x="6" y="6" width="88" height="14" fill="#dfa585" />
                <rect x="6" y="6" width="14" height="138" fill="#dfa585" />

                {/* Right and Bottom Depth Shadows */}
                <rect x="80" y="6" width="14" height="138" fill="#935b3d" />
                <rect x="6" y="130" width="88" height="14" fill="#935b3d" />

                {/* Deep right bottom intersection */}
                <rect x="80" y="130" width="14" height="14" fill="#6a3a1f" />

                {/* Custom Pixel Variations for authentic Minecraft block texture */}
                {/* Highlight pixels */}
                <rect x="25" y="30" width="12" height="12" fill="#dfa585" opacity="0.6" />
                <rect x="40" y="65" width="12" height="12" fill="#dfa585" opacity="0.4" />
                <rect x="15" y="90" width="12" height="12" fill="#dfa585" opacity="0.5" />

                {/* Shadow pixels */}
                <rect x="60" y="45" width="12" height="12" fill="#935b3d" opacity="0.7" />
                <rect x="50" y="85" width="12" height="12" fill="#6a3a1f" opacity="0.5" />
                <rect x="35" y="110" width="12" height="12" fill="#935b3d" opacity="0.6" />
                <rect x="68" y="105" width="12" height="12" fill="#6a3a1f" opacity="0.8" />
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Bottom Trading / Stats HUD - Minimal Solid block */}
        <div className="w-full bg-black border-4 border-white p-4.5 z-10 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-col">
              <span className="font-courier text-[10px] font-bold text-zinc-400 tracking-wider uppercase">TRADING INTERACTION</span>
              <h4 className="font-courier text-xs font-bold text-white uppercase tracking-wider mt-0.5">EMERALD REVENUE</h4>
              <p className="font-courier text-[11px] text-zinc-400 mt-1">Total HMMs triggered: <span className="font-bold text-white">{clicks}</span></p>
            </div>

            {/* Emerald counter slot - High contrast border */}
            <div className="bg-black px-4 py-2.5 border-4 border-emerald-500 flex items-center gap-2.5 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.15)]">
              <span className="text-xl">🟢</span>
              <div className="flex flex-col">
                <span className="font-courier text-[9px] font-bold text-emerald-400 leading-none tracking-wider">EMERALDS</span>
                <span className="font-courier text-lg font-bold text-white leading-none mt-1">{clicks}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controller Controls */}
      <div className="w-full lg:w-96 flex flex-col justify-between gap-6">
        
        {/* Voice Presets Panel - White Outlined minimalist container */}
        <div className="bg-black border-4 border-white p-6 flex-1 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]">
          <div>
            <h3 className="font-courier text-xs font-bold text-white tracking-widest uppercase mb-2 flex items-center gap-2">
              🔊 HMM SYNTH PRESETS
            </h3>
            <p className="text-zinc-400 text-xs font-courier leading-relaxed mb-5">
              Select different synthesized "Hmm" moods. Each uses advanced oscillators, bandpass filters, and customized pitch bends.
            </p>

            <div className="space-y-3">
              {SOUND_PRESETS.map(preset => {
                const isActive = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setActivePreset(preset.id);
                      soundEngine.play(preset.id);
                    }}
                    className={`w-full text-left p-3 border-4 transition flex items-start gap-3.5 cursor-pointer ${
                      isActive 
                        ? 'bg-white text-black border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]' 
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-900'
                    }`}
                  >
                    <span className={`text-lg p-2 border-2 ${isActive ? 'bg-black border-black text-white' : 'bg-zinc-900 border-zinc-700'}`}>
                      {preset.id === 'ambient' && '🤔'}
                      {preset.id === 'trade' && '🌾'}
                      {preset.id === 'disagree' && '😡'}
                      {preset.id === 'yes' && '💎'}
                      {preset.id === 'no' && '❌'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-courier font-bold text-xs uppercase tracking-wide truncate">{preset.name}</span>
                        <span className={`font-courier font-bold text-[9px] px-1.5 py-0.5 border uppercase leading-none tracking-wider shrink-0 ${
                          isActive 
                            ? 'bg-black text-white border-black' 
                            : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                        }`}>
                          {preset.label}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-1.5 leading-normal truncate ${isActive ? 'text-zinc-700' : 'text-zinc-500'}`}>{preset.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation on Web Audio Synthesizer - Custom courier outline container */}
          <div className="mt-6 bg-[#1a1a1a]/60 border-4 border-zinc-800 p-4 text-zinc-400 text-xs leading-relaxed font-courier">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-1.5 text-[11px]">
              <HelpCircle className="w-3.5 h-3.5 text-white" />
              How the Web Synthesizer works:
            </span>
            <span>
              This simulator synthesizes the villager's iconic <code className="text-white font-bold font-mono">"Hmm"</code> sound completely in real-time. It layers sawtooth, triangle, and sine wave oscillators, routes them through parallel bandpass filters to mimic human throat formants, and dynamically sweeps the pitch with ADSR envelopes!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
