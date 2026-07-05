export function exportShortlistCsv(colleges: { id: string; name: string; fee: number; avgLpa: number }[]): string {
  const headers = ['ID,Name,Fee(INR),AvgPlacement(LPA)'];
  const rows = colleges.map(c => `${c.id},"${c.name.replace(/"/g, '""')}",${c.fee},${c.avgLpa}`);
  return [...headers, ...rows].join('\n');
}
