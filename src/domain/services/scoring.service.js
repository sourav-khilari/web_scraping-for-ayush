export function scoreItem({ sectorMatch, investmentSignal, publishedAt }) {
  let score = 0;
  if (sectorMatch) score += 45;
  if (investmentSignal) score += 45;
  if (publishedAt instanceof Date) {
    const ageDays = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays <= 7) score += 10;
    else if (ageDays <= 30) score += 5;
  }
  return score;
}
