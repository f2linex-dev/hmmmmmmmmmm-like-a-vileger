export interface KMPFile {
  name: string;
  path: string;
  language: 'kotlin' | 'groovy' | 'xml' | 'properties' | 'swift';
  content: string;
}

export interface KMPFolder {
  name: string;
  files: KMPFile[];
  subfolders?: KMPFolder[];
}

export type HmmType = 'ambient' | 'trade' | 'disagree' | 'yes' | 'no';

export interface SoundPreset {
  id: HmmType;
  name: string;
  label: string;
  description: string;
  baseFreq: number;
  pitchShift: number;
  duration: number;
}
