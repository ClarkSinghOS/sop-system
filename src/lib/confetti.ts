// Confetti utility - provides a safe wrapper around canvas-confetti
// Falls back gracefully if the package isn't installed

type ConfettiOptions = {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
};

let confettiModule: ((opts: ConfettiOptions) => void) | null = null;
let loadAttempted = false;

async function loadConfetti() {
  if (loadAttempted) return confettiModule;
  loadAttempted = true;
  
  try {
    const mod = await import('canvas-confetti');
    confettiModule = mod.default;
  } catch {
    // Package not installed, confetti will be a no-op
    console.log('canvas-confetti not installed, celebrations will be silent');
  }
  
  return confettiModule;
}

export async function fireConfetti(options: ConfettiOptions = {}) {
  const confetti = await loadConfetti();
  if (confetti) {
    confetti({
      particleCount: options.particleCount || 50,
      spread: options.spread || 70,
      origin: options.origin || { y: 0.6 },
      colors: options.colors || ['#10b981', '#22d3ee', '#a3e635'],
    });
  }
}

export function fireConfettiSync(options: ConfettiOptions = {}) {
  // Sync version that doesn't wait for loading
  if (confettiModule) {
    confettiModule({
      particleCount: options.particleCount || 50,
      spread: options.spread || 70,
      origin: options.origin || { y: 0.6 },
      colors: options.colors || ['#10b981', '#22d3ee', '#a3e635'],
    });
  }
}

// Pre-load confetti on module import
if (typeof window !== 'undefined') {
  loadConfetti();
}
