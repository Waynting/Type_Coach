import type { KeyStat, BigramStat } from './types';

export function weaknessScore(s: KeyStat, rtMean = 210, rtStd = 40): number {
  const errRate = s.errors / Math.max(1, s.hits);
  const rtZ = (s.ewmaRt - rtMean) / Math.max(1, rtStd);
  const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
  return 0.6 * errRate + 0.3 * sigmoid(rtZ) + 0.1 * Math.min(1, s.errors / 20);
}

export function bigramWeaknessScore(s: BigramStat, rtMean = 300, rtStd = 60): number {
  const errRate = s.errors / Math.max(1, s.hits);
  const rtZ = (s.ewmaRt - rtMean) / Math.max(1, rtStd);
  const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
  return 0.6 * errRate + 0.3 * sigmoid(rtZ) + 0.1 * Math.min(1, s.errors / 20);
}

export function getTopWeakKeys(
  keyStats: Record<string, KeyStat>, 
  n = 5,
  minHits = 5
): KeyStat[] {
  const eligible = Object.values(keyStats)
    .filter(s => s.hits >= minHits)
    .sort((a, b) => weaknessScore(b) - weaknessScore(a));
  
  return eligible.slice(0, n);
}

export function getTopWeakBigrams(
  bigramStats: Record<string, BigramStat>,
  n = 5,
  minHits = 3
): BigramStat[] {
  const eligible = Object.values(bigramStats)
    .filter(s => s.hits >= minHits)
    .sort((a, b) => bigramWeaknessScore(b) - bigramWeaknessScore(a));
  
  return eligible.slice(0, n);
}

export function getTopConfusions(
  confusion: Record<string, { pair: string; count: number }>,
  n = 5
): Array<{ expected: string; received: string; count: number }> {
  const sorted = Object.values(confusion)
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
  
  return sorted.map(({ pair, count }) => {
    const [expected, received] = pair.split('|');
    return { expected, received, count };
  });
}