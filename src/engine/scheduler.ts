import type { Profile, KeyStat, BigramStat } from './types';
import { weaknessScore, bigramWeaknessScore } from './weakness';

export function keyCodeToChar(code: string): string {
  if (code.startsWith("Key")) return code[3].toLowerCase();
  if (code === "Space") return " ";
  if (code === "Comma") return ",";
  if (code === "Period") return ".";
  if (code === "Semicolon") return ";";
  if (code === "Quote") return "'";
  if (code.startsWith("Digit")) return code[5];
  return code.toLowerCase();
}

export function charToKeyCode(char: string): string {
  if (char === " ") return "Space";
  if (char === ",") return "Comma";
  if (char === ".") return "Period";
  if (char === ";") return "Semicolon";
  if (char === "'") return "Quote";
  if (char >= "0" && char <= "9") return `Digit${char}`;
  if (char >= "a" && char <= "z") return `Key${char.toUpperCase()}`;
  if (char >= "A" && char <= "Z") return `Key${char}`;
  // For any other character, return a generic format
  return `Key${char.toUpperCase()}`;
}

export function buildKeyDrill(profile: Profile, n = 60): string {
  const arr = Object.values(profile.keyStats);
  arr.sort((a, b) => weaknessScore(b) - weaknessScore(a));
  const pool = arr.slice(0, 10).flatMap(s => s.code);
  
  let out = "";
  for (let i = 0; i < n; i++) {
    const code = pool[Math.floor(Math.random() * pool.length)];
    out += keyCodeToChar(code);
  }
  return out;
}

export function buildBigramDrill(profile: Profile, n = 60): string {
  const arr = Object.values(profile.bigramStats);
  arr.sort((a, b) => bigramWeaknessScore(b) - bigramWeaknessScore(a));
  const topBigrams = arr.slice(0, 10);
  
  let out = "";
  let count = 0;
  
  while (count < n && topBigrams.length > 0) {
    const bigram = topBigrams[Math.floor(Math.random() * topBigrams.length)];
    const [first, second] = bigram.bigram.split('>');
    out += keyCodeToChar(first) + keyCodeToChar(second) + " ";
    count += 3; // 2 chars + space
  }
  
  return out.trim();
}

// Diverse vocabulary with different lengths
const VOCABULARY = {
  short: ["a", "I", "to", "of", "is", "in", "it", "on", "be", "at", "or", "as", "an", "we", "my", "me", "go", "up", "do", "no"],
  medium: ["the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was", "one", "our", "out", "day", "get", "has", "him", "his", "how", "its", "may", "new", "now", "old", "see", "two", "way", "who", "boy", "did", "car", "let", "put", "say", "she", "too", "use"],
  long: ["about", "after", "again", "before", "being", "every", "first", "found", "great", "group", "large", "might", "never", "other", "place", "right", "small", "sound", "still", "think", "three", "under", "water", "where", "while", "world", "would", "write", "young"],
  longer: ["another", "because", "between", "company", "country", "different", "example", "government", "important", "information", "interest", "national", "nothing", "particular", "possible", "problem", "question", "really", "something", "together", "without", "yourself"],
  technical: ["function", "variable", "algorithm", "database", "framework", "interface", "development", "programming", "application", "technology", "computer", "internet", "software", "hardware", "network"],
  numbers: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "100", "123", "456", "789", "2023", "2024"],
  mixed: ["abc123", "test123", "user001", "file2024", "data007", "code42", "app3.0", "v1.2.3", "id12345", "key2024"]
};

export function buildMixedDrill(
  profile: Profile, 
  n = 100,
  weaknessRatio = 0.7,
  includeNumbers = false,
  includeMixed = false
): string {
  const weaknessCount = Math.floor(n * weaknessRatio);
  const normalCount = n - weaknessCount;
  
  // Get weak keys
  const weakKeys = Object.values(profile.keyStats)
    .filter(s => s.hits > 5)
    .sort((a, b) => weaknessScore(b) - weaknessScore(a))
    .slice(0, 10)
    .map(s => keyCodeToChar(s.code));
  
  // Build word pool based on options
  let wordPool = [
    ...VOCABULARY.short,
    ...VOCABULARY.medium,
    ...VOCABULARY.long,
    ...VOCABULARY.longer,
    ...VOCABULARY.technical
  ];
  
  if (includeNumbers) {
    wordPool = [...wordPool, ...VOCABULARY.numbers];
  }
  
  if (includeMixed) {
    wordPool = [...wordPool, ...VOCABULARY.mixed];
  }
  
  let drill = "";
  let charCount = 0;
  
  // Add weakness-focused content (only real words)
  while (charCount < weaknessCount && weakKeys.length > 0) {
    // Use words that contain weak keys
    const wordsWithWeakKeys = wordPool.filter(word => 
      weakKeys.some(key => word.includes(key))
    );
    
    if (wordsWithWeakKeys.length > 0) {
      const word = wordsWithWeakKeys[Math.floor(Math.random() * wordsWithWeakKeys.length)];
      if (charCount + word.length + 1 <= weaknessCount) {
        drill += word + " ";
        charCount += word.length + 1;
      } else {
        break;
      }
    } else {
      // If no words contain weak keys, use random words from pool
      const word = wordPool[Math.floor(Math.random() * wordPool.length)];
      if (charCount + word.length + 1 <= weaknessCount) {
        drill += word + " ";
        charCount += word.length + 1;
      } else {
        break;
      }
    }
  }
  
  // Add diverse vocabulary
  while (charCount < n && wordPool.length > 0) {
    // Weighted selection favoring longer words for variety
    let selectedWord;
    const rand = Math.random();
    
    if (rand < 0.15) {
      // 15% short words
      const shortWords = wordPool.filter(w => w.length <= 3);
      selectedWord = shortWords[Math.floor(Math.random() * shortWords.length)] || wordPool[0];
    } else if (rand < 0.35) {
      // 20% medium words (4-6 chars)
      const mediumWords = wordPool.filter(w => w.length >= 4 && w.length <= 6);
      selectedWord = mediumWords[Math.floor(Math.random() * mediumWords.length)] || wordPool[0];
    } else if (rand < 0.7) {
      // 35% long words (7-10 chars)
      const longWords = wordPool.filter(w => w.length >= 7 && w.length <= 10);
      selectedWord = longWords[Math.floor(Math.random() * longWords.length)] || wordPool[0];
    } else {
      // 30% longer words (11+ chars)
      const longerWords = wordPool.filter(w => w.length >= 11);
      selectedWord = longerWords[Math.floor(Math.random() * longerWords.length)] || wordPool[0];
    }
    
    if (selectedWord && charCount + selectedWord.length + 1 <= n) {
      drill += selectedWord + " ";
      charCount += selectedWord.length + 1;
    } else {
      break;
    }
  }
  
  return drill.trim();
}

export function generateRandomText(
  targetChars: number = 300,
  includeNumbers = false
): string {
  // Simplified vocabulary for better variety
  const words = [
    // Short words (1-3 chars)
    "a", "an", "as", "at", "be", "by", "do", "go", "he", "if", "in", "is", "it", "me", "my", "no", "of", "on", "or", "so", "to", "up", "we",
    "and", "are", "but", "can", "for", "get", "had", "has", "her", "him", "his", "how", "its", "may", "new", "not", "now", "old", "one", "our", "out", "see", "she", "the", "too", "two", "use", "was", "way", "who", "win", "you",
    
    // Medium words (4-6 chars)
    "about", "after", "again", "being", "could", "every", "first", "found", "great", "group", "house", "into", "just", "know", "large", "last", "life", "line", "long", "look", "make", "many", "most", "move", "much", "need", "next", "only", "over", "part", "place", "right", "said", "same", "seem", "show", "small", "some", "take", "than", "that", "they", "this", "time", "very", "want", "water", "well", "went", "were", "what", "when", "where", "which", "while", "will", "with", "work", "world", "would", "write", "year", "your",
    
    // Longer words (7+ chars)
    "another", "because", "between", "company", "country", "develop", "different", "example", "general", "government", "however", "important", "include", "interest", "national", "nothing", "particular", "perhaps", "picture", "problem", "program", "question", "really", "should", "something", "special", "student", "system", "through", "together", "without", "yourself"
  ];

  if (includeNumbers) {
    words.push("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "100", "123", "2024");
  }

  let text = "";
  let currentLength = 0;
  
  while (currentLength < targetChars) {
    const word = words[Math.floor(Math.random() * words.length)];
    
    if (currentLength + word.length + 1 <= targetChars) {
      text += (text ? " " : "") + word;
      currentLength += word.length + (text === word ? 0 : 1);
    } else {
      break;
    }
  }
  
  return text;
}

export function generateAdaptiveDrill(
  profile: Profile, 
  mode: "keys" | "bigrams" | "mixed", 
  duration: number,
  includeNumbers = false,
  includeMixed = false
): string {
  const charsPerMinute = 675; // Estimate for drill mode
  const targetChars = Math.floor(charsPerMinute * (duration / 60));
  
  switch (mode) {
    case "keys":
      return buildKeyDrill(profile, targetChars);
    case "bigrams":
      return buildBigramDrill(profile, targetChars);
    case "mixed":
    default:
      return buildMixedDrill(profile, targetChars, 0.7, includeNumbers, includeMixed);
  }
}