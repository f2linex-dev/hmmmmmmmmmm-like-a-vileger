import React from 'react';
import VillagePreview from './components/VillagePreview';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-zinc-100 flex flex-col font-mono selection:bg-amber-400 selection:text-black">
      
      {/* Header */}
      <header className="bg-black border-b-4 border-white py-6 px-6 shrink-0 relative">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Minimalist flat representation of character face */}
            <div className="w-12 h-12 bg-[#bd8e72] border-4 border-white flex flex-col justify-between p-1.5 shrink-0 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
              <div className="flex justify-between">
                <div className="w-2.5 h-2.5 bg-black" />
                <div className="w-2.5 h-2.5 bg-black" />
              </div>
              <div className="w-3.5 h-5 bg-[#946b5a] border-2 border-black mx-auto" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-courier text-xl md:text-2xl font-bold uppercase tracking-widest text-white select-none">
                  VILLAGER HMM
                </h1>
                <span className="bg-white text-black font-courier font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 border-2 border-black rounded-sm">
                  WEB SYNTHESIZER
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 font-courier tracking-wide">
                An Interactive Minecraft Villager Voice & Synthesizer Simulator
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col justify-between">
        
        <div className="flex-1 space-y-6">
          <div className="bg-black border-4 border-white p-5 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white font-courier">Interactive Mob Simulator</h2>
              <p className="text-xs text-zinc-400 mt-1 font-courier leading-relaxed">
                Play with the live Minecraft Villager simulator! Click his big blocky nose to hear his voice, earn emeralds, and cycle through 5 distinct synthesized oscillator presets.
              </p>
            </div>
            <div className="text-[10px] text-white font-bold font-courier bg-[#3d7a24] border-2 border-white px-3 py-1.5 rounded-sm shrink-0 hidden md:block tracking-widest">
              AUDIO SYNTH ACTIVE
            </div>
          </div>
          <VillagePreview />
        </div>

        {/* Footer */}
        <footer className="mt-12 py-8 border-t-4 border-zinc-800 text-center shrink-0">
          <p className="font-courier text-[10px] font-bold text-zinc-500 tracking-widest select-none uppercase">
            © 2026 VILLAGER HMM — POWERED BY WEB AUDIO API SYNTHESIS
          </p>
        </footer>
      </main>
    </div>
  );
}
