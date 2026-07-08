function parseTimeToSeconds(time) {
  if (!time) return 0;
  const [minutes, seconds] = time.split(":").map(Number);
  return (minutes || 0) * 60 + (seconds || 0);
}
function formatSecondsToTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
export {
  formatSecondsToTime as f,
  parseTimeToSeconds as p
};
