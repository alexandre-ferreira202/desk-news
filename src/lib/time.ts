// Converte "MM:SS" para segundos
export function parseTimeToSeconds(time: string | null): number {
  if (!time) return 0;
  const [minutes, seconds] = time.split(':').map(Number);
  return (minutes || 0) * 60 + (seconds || 0);
}

// Converte segundos para "MM:SS"
export function formatSecondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
