import { HmmType, SoundPreset } from '../types';

export const SOUND_PRESETS: SoundPreset[] = [
  {
    id: 'ambient',
    name: 'Classic Ambient',
    label: 'Hmm...',
    description: 'The standard inquisitive villager idle sound.',
    baseFreq: 115,
    pitchShift: -25,
    duration: 0.75,
  },
  {
    id: 'trade',
    name: 'Trading Hum',
    label: 'Hmrrm?',
    description: 'The curious sound made when inspecting items.',
    baseFreq: 130,
    pitchShift: 10,
    duration: 0.6,
  },
  {
    id: 'disagree',
    name: 'Disagreeable Hmph',
    label: 'Hrrmmm.',
    description: 'Low-pitch disgruntled buzz when a trade is rejected.',
    baseFreq: 100,
    pitchShift: -35,
    duration: 0.9,
  },
  {
    id: 'yes',
    name: 'Affirmative Double-Hum',
    label: 'Hm-hmm!',
    description: 'A higher-pitch dual-hum meaning a trade was accepted.',
    baseFreq: 135,
    pitchShift: 15,
    duration: 0.45,
  },
  {
    id: 'no',
    name: 'Abrupt No',
    label: 'Hreh!',
    description: 'A sharp, short negative grunt.',
    baseFreq: 95,
    pitchShift: -10,
    duration: 0.35,
  }
];

class SoundEngine {
  private ctx: AudioContext | null = null;

  constructor() {
    // AudioContext will be initialized lazily on the first user interaction to comply with browser autoplay security policies
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(presetId: HmmType) {
    this.initContext();
    const ctx = this.ctx;
    if (!ctx) return;

    const preset = SOUND_PRESETS.find(p => p.id === presetId) || SOUND_PRESETS[0];

    if (presetId === 'yes') {
      // Play a double hum for the "yes" sound
      this.synthesizeSingleHmm(ctx, preset.baseFreq, preset.pitchShift, preset.duration * 0.5, 0);
      this.synthesizeSingleHmm(ctx, preset.baseFreq + 15, preset.pitchShift + 5, preset.duration * 0.6, preset.duration * 0.45);
    } else {
      this.synthesizeSingleHmm(ctx, preset.baseFreq, preset.pitchShift, preset.duration, 0);
    }
  }

  private synthesizeSingleHmm(
    ctx: AudioContext,
    baseFreq: number,
    pitchShift: number,
    duration: number,
    delay: number
  ) {
    const startTime = ctx.currentTime + delay;
    const endTime = startTime + duration;

    // 1. Create primary oscillators for nasal hum (combination of Sawtooth and Triangle)
    const oscSaw = ctx.createOscillator();
    const oscTri = ctx.createOscillator();
    const oscSub = ctx.createOscillator();

    oscSaw.type = 'sawtooth';
    oscTri.type = 'triangle';
    oscSub.type = 'sine';

    // 2. Volume nodes to blend waves
    const gainSaw = ctx.createGain();
    const gainTri = ctx.createGain();
    const gainSub = ctx.createGain();
    const masterGain = ctx.createGain();

    gainSaw.gain.setValueAtTime(0.35, startTime);
    gainTri.gain.setValueAtTime(0.45, startTime);
    gainSub.gain.setValueAtTime(0.20, startTime); // Sub bass warmth

    // 3. Connect oscillators to their gain nodes
    oscSaw.connect(gainSaw);
    oscTri.connect(gainTri);
    oscSub.connect(gainSub);

    // 4. Formant Filters (Crucial for the nasal, vocal "Mmmm" quality)
    // Human formants for low nasal 'm' vocalization:
    // F1 around 300Hz (strong, nasal)
    // F2 around 700Hz
    // F3 around 2000Hz (softer)
    const f1Filter = ctx.createBiquadFilter();
    f1Filter.type = 'bandpass';
    f1Filter.frequency.setValueAtTime(320, startTime);
    f1Filter.Q.setValueAtTime(6, startTime);

    const f2Filter = ctx.createBiquadFilter();
    f2Filter.type = 'bandpass';
    f2Filter.frequency.setValueAtTime(700, startTime);
    f2Filter.Q.setValueAtTime(5, startTime);

    const f3Filter = ctx.createBiquadFilter();
    f3Filter.type = 'peaking';
    f3Filter.frequency.setValueAtTime(2200, startTime);
    f3Filter.Q.setValueAtTime(2, startTime);
    f3Filter.gain.setValueAtTime(-10, startTime); // soften high formants for the soft hum

    // High cut to remove harsh upper buzz, keeping it muffled and nasal
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1100, startTime);

    // Connect oscillators into parallel formant channels
    gainSaw.connect(f1Filter);
    gainTri.connect(f1Filter);
    gainSub.connect(f1Filter);

    gainSaw.connect(f2Filter);
    gainTri.connect(f2Filter);

    // Rejoin streams to lowpass filter
    f1Filter.connect(lowpass);
    f2Filter.connect(lowpass);
    f3Filter.connect(lowpass);

    lowpass.connect(masterGain);
    masterGain.connect(ctx.destination);

    // 5. Pitch Sweep Envelope (Classic Villager "bending" sound)
    oscSaw.frequency.setValueAtTime(baseFreq, startTime);
    oscTri.frequency.setValueAtTime(baseFreq, startTime);
    oscSub.frequency.setValueAtTime(baseFreq, startTime);

    // Middle of the hum maintains pitch
    const pitchMidsTime = startTime + duration * 0.4;
    oscSaw.frequency.setValueAtTime(baseFreq, pitchMidsTime);
    oscTri.frequency.setValueAtTime(baseFreq, pitchMidsTime);
    oscSub.frequency.setValueAtTime(baseFreq, pitchMidsTime);

    // End of hum curves down (or up, depending on the preset)
    const targetFreq = baseFreq + pitchShift;
    oscSaw.frequency.exponentialRampToValueAtTime(targetFreq, endTime);
    oscTri.frequency.exponentialRampToValueAtTime(targetFreq, endTime);
    oscSub.frequency.exponentialRampToValueAtTime(targetFreq, endTime);

    // 6. Amplitude Envelope (Smooth attack, sustained body, decay at the end)
    const attack = 0.04; // 40ms attack for "H" start
    const decay = 0.12;  // release decay time

    masterGain.gain.setValueAtTime(0.001, startTime);
    // Attack phase
    masterGain.gain.exponentialRampToValueAtTime(0.7, startTime + attack);
    // Steady sustain phase
    masterGain.gain.setValueAtTime(0.7, endTime - decay);
    // Release phase
    masterGain.gain.exponentialRampToValueAtTime(0.001, endTime);

    // 7. Start and Stop nodes
    oscSaw.start(startTime);
    oscTri.start(startTime);
    oscSub.start(startTime);

    oscSaw.stop(endTime);
    oscTri.stop(endTime);
    oscSub.stop(endTime);
  }
}

export const soundEngine = new SoundEngine();
