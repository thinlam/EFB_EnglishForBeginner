export function percentFromLessons(p?: { lessonsDone?: number; lessonsTotal?: number }) {
  if (!p?.lessonsDone || !p?.lessonsTotal) return 0;
  return (p.lessonsDone / Math.max(1, p.lessonsTotal)) * 100;
}
