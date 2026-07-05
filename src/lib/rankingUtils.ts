export function getNirfBadgeColor(rank?: number): string {
  if (!rank) return 'gray';
  if (rank <= 10) return 'emerald';
  if (rank <= 50) return 'blue';
  if (rank <= 100) return 'amber';
  return 'slate';
}
