import type { Keystroke, KeyStat, Bigram, BigramStat, ConfusionKey, ConfusionStat, KeyCode } from './types';

export function updateKeyStats(stats: Record<string, KeyStat>, k: Keystroke) {
  const code = k.expected ?? k.received;
  const s = stats[code] ?? { code, hits: 0, errors: 0, avgRt: 0, ewmaRt: 220 };
  s.hits += 1;
  if (!k.correct) s.errors += 1;
  s.avgRt = s.avgRt + (k.latencyMs - s.avgRt) / s.hits;
  const alpha = 0.3;
  s.ewmaRt = alpha * k.latencyMs + (1 - alpha) * s.ewmaRt;
  stats[code] = s;
}

export function updateBigramStats(
  stats: Record<Bigram, BigramStat>, 
  prev: KeyCode | null, 
  curr: KeyCode,
  latencyMs: number,
  correct: boolean
) {
  if (!prev) return;
  
  const bigram: Bigram = `${prev}>${curr}`;
  const s = stats[bigram] ?? { bigram, hits: 0, errors: 0, ewmaRt: 300 };
  s.hits += 1;
  if (!correct) s.errors += 1;
  const alpha = 0.3;
  s.ewmaRt = alpha * latencyMs + (1 - alpha) * s.ewmaRt;
  stats[bigram] = s;
}

export function updateConfusionMatrix(
  confusion: Record<ConfusionKey, ConfusionStat>,
  expected: KeyCode,
  received: KeyCode
) {
  if (expected === received) return;
  
  const pair: ConfusionKey = `${expected}|${received}`;
  const s = confusion[pair] ?? { pair, count: 0 };
  s.count += 1;
  confusion[pair] = s;
}

export function calculateWPM(correctChars: number, durationSec: number): number {
  if (durationSec === 0) return 0;
  return Math.round((correctChars / 5) / (durationSec / 60));
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}