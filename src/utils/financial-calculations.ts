export interface Point {
  x: number;
  y: number;
}

export function distance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calculateMonthlySavings(
  targetAmount: number,
  months: number,
  currentSavings: number = 0
): number {
  const remainingAmount = targetAmount - currentSavings;
  return remainingAmount / months;
}

export function calculateCompoundInterest(
  principal: number,
  annualRate: number,
  years: number,
  compoundingFrequency: number = 12
): number {
  const rate = annualRate / 100;
  const n = compoundingFrequency;
  const t = years;
  
  return principal * Math.pow(1 + rate / n, n * t);
}

export function calculateRealInterestRate(
  nominalRate: number,
  inflationRate: number
): number {
  return ((1 + nominalRate / 100) / (1 + inflationRate / 100) - 1) * 100;
}

if (import.meta.vitest) {
  const { test, expect, describe } = import.meta.vitest;
  
  describe('distance', () => {
    test('ユークリッド距離を計算する', () => {
      const result = distance({ x: 0, y: 0 }, { x: 3, y: 4 });
      expect(result).toBe(5);
    });
    
    test('同じ点の距離は0', () => {
      const result = distance({ x: 5, y: 5 }, { x: 5, y: 5 });
      expect(result).toBe(0);
    });
  });
  
  describe('calculateMonthlySavings', () => {
    test('月々の必要貯蓄額を計算する', () => {
      const result = calculateMonthlySavings(3000000, 24);
      expect(result).toBe(125000);
    });
    
    test('既存の貯蓄を考慮する', () => {
      const result = calculateMonthlySavings(3000000, 24, 500000);
      expect(result).toBeCloseTo(104166.67, 2);
    });
  });
  
  describe('calculateCompoundInterest', () => {
    test('複利計算を行う', () => {
      const result = calculateCompoundInterest(1000000, 5, 10);
      expect(result).toBeCloseTo(1647009.50, 2);
    });
    
    test('年1回の複利計算', () => {
      const result = calculateCompoundInterest(1000000, 5, 10, 1);
      expect(result).toBeCloseTo(1628894.63, 2);
    });
  });
  
  describe('calculateRealInterestRate', () => {
    test('実質金利を計算する', () => {
      const result = calculateRealInterestRate(5, 2);
      expect(result).toBeCloseTo(2.94, 2);
    });
    
    test('インフレ率が名目金利を上回る場合', () => {
      const result = calculateRealInterestRate(2, 3);
      expect(result).toBeCloseTo(-0.97, 2);
    });
  });
}