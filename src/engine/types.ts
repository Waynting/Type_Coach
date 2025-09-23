export type KeyCode = string;       // e.g., "KeyA","Space","Comma"
export type Timestamp = number;     // performance.now()

export type Keystroke = {
  ts: Timestamp;
  expected: KeyCode | null;  // null=自由輸入模式
  received: KeyCode;
  correct: boolean;
  latencyMs: number;         // 與前次鍵/或目標字元的間隔
  backspace?: boolean;
};

export type KeyStat = {
  code: KeyCode;
  hits: number;
  errors: number;
  avgRt: number;
  ewmaRt: number;            // 指數加權移動平均
};

export type Bigram = `${KeyCode}>${KeyCode}`;
export type BigramStat = { 
  bigram: Bigram; 
  hits: number; 
  errors: number; 
  ewmaRt: number; 
};

export type ConfusionKey = `${KeyCode}|${KeyCode}`; // expected|received
export type ConfusionStat = { 
  pair: ConfusionKey; 
  count: number 
};

export type Session = {
  id: string;
  startedAt: number;
  durationSec: number;
  mode: "timed" | "paragraph" | "drill";
  wpm: number;
  accuracy: number;
  totalKeystrokes: number;
  keystrokes: Keystroke[];   // 可裁剪保存
};

export type Profile = {
  layout: "QWERTY";
  keyStats: Record<KeyCode, KeyStat>;
  bigramStats: Record<Bigram, BigramStat>;
  confusion: Record<ConfusionKey, ConfusionStat>;
  history: string[];         // session ids
  goals?: { key?: KeyCode; targetRtMs?: number }[];
};