export interface CollegeItem { id: string; name: string; annualFee: number; averagePlacementLPA: number; }
export function computeRoiScore(college: CollegeItem): number {
  if (college.annualFee <= 0) return 0;
  return Number(((college.averagePlacementLPA / (college.annualFee * 4 / 100000)) * 10).toFixed(2));
}
