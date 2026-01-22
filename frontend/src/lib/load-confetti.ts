
export function loadConfetti() {
  if (typeof window !== 'undefined' && !window.confetti) {
    // Dynamically import confetti
    import('canvas-confetti').then((confetti) => {
      window.confetti = confetti.default;
    });
  }
}
