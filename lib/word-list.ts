// 🌍 Expanded English + Crypto/Tech-themed Word List (5-letter words)
export const CRYPTO_WORDS = [
  // --- Crypto & Finance ---
  "BLOCK", "CHAIN", "TOKEN", "STAKE", "COINS", "MINTS", "FUNDS", "SHARE", "MONEY", "TRUST",
  "TRADE", "CASHY", "PRICE", "VALUE", "CENTS", "RATES", "YIELD", "CREDIT", "LOANS", "BANKS",
  "MARKT", "BUYER", "SELLS", "WALKS", "DEBIT", "ASSET", "FEESY", "REPAY", "FUNDS", "VAULT",
  "LEDGE", "PROOF", "MINER", "RELAY", "BURNS", "MINTS", "CLAIM", "SPEND",

  // --- Tech & Web3 terms ---
  "INPUT", "BYTES", "CODES", "DEBUG", "REACT", "SOLID", "NODES", "LOGIC", "STACK", "QUERY",
  "STORE", "CACHE", "INDEX", "ARRAY", "TOKEN", "SMART", "BATCH", "VALUE", "LINKS", "CHAIN",
  "LOOPS", "FRONT", "LOGIN", "DEPTH", "MERGE", "FILES", "CLOUD", "DRIVE", "ETHER", "GASPY",

  // --- General English / Wordle-friendly mix ---
  "LIGHT", "POWER", "TRUST", "BRAVE", "FORGE", "HOUSE", "HONEY", "RIVER", "MUSIC", "STORM",
  "BRAIN", "HEART", "PEACE", "STONE", "WORLD", "EARTH", "SKILL", "FOCUS", "MAGIC", "TRUTH",
  "DREAM", "UNITY", "FAITH", "GRACE", "LUCKY", "NOBLE", "PRIDE", "SWEET", "CLEAR", "QUIET",
  "WISER", "SOLID", "FRESH", "MOVER", "RANGE", "RAPID", "SHINE", "SPEED", "STARS", "SOLAR",
  "LUNAR", "STORY", "TRACE", "POINT", "CROWN", "NORTH", "SOUTH", "EASTS", "WESTS", "OCEAN",
  "MOUNT", "RIDER", "ANGEL", "GHOST", "BEAST", "TIGER", "EAGLE", "HORSE", "WAVES", "TREND",
  "SPARK", "GLOBE", "BLOOM", "RALLY", "SURGE", "CRASH", "LEVEL", "FINAL", "GIANT", "BLAZE",
  "CLEAR", "FOCUS", "UNITY", "FORCE", "RHYME", "NOVEL", "SCENE", "BLISS", "HUMAN", "SOLAR",
  "BRAND", "MODEL", "VIRAL", "TREND", "BOOST", "IDEAL", "POWER", "VOICE", "MEDIA", "CREAM"
];

export function getRandomWord(): string {
  return CRYPTO_WORDS[Math.floor(Math.random() * CRYPTO_WORDS.length)];
}

export function getWordOfDay(date: Date = new Date()): string {
  // Deterministic word selection based on date
  const dayNumber = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return CRYPTO_WORDS[dayNumber % CRYPTO_WORDS.length];
}
