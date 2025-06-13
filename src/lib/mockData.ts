export interface CashFlow {
  id: string;
  trans_date: string;
  category: string;
  amount: number;
  memo: string;
}

export interface Asset {
  id: string;
  asset_type: string;
  name: string;
  balance: number;
  valuation_date: string;
}

export const mockCashFlows: CashFlow[] = [
  {
    id: '1',
    trans_date: '2025-01-11',
    category: 'Salary',
    amount: 500000,
    memo: '月給'
  },
  {
    id: '2',
    trans_date: '2025-01-10',
    category: 'Food',
    amount: -1200,
    memo: 'ランチ'
  },
  {
    id: '3',
    trans_date: '2025-01-09',
    category: 'Transport',
    amount: -300,
    memo: '電車代'
  },
  {
    id: '4',
    trans_date: '2025-01-08',
    category: 'Entertainment',
    amount: -3000,
    memo: '映画'
  },
  {
    id: '5',
    trans_date: '2025-01-07',
    category: 'Food',
    amount: -800,
    memo: 'コンビニ'
  }
];

export const mockAssets: Asset[] = [
  {
    id: '1',
    asset_type: 'Bank',
    name: '普通預金',
    balance: 1500000,
    valuation_date: '2025-01-11'
  },
  {
    id: '2',
    asset_type: 'Investment',
    name: '株式投資',
    balance: 2500000,
    valuation_date: '2025-01-11'
  },
  {
    id: '3',
    asset_type: 'Bank',
    name: '定期預金',
    balance: 800000,
    valuation_date: '2025-01-11'
  }
];

export const mockFinancialAdvice = [
  '月の支出をもう少し詳しく記録しましょう',
  '緊急資金として3-6ヶ月分の生活費を貯蓄することをお勧めします',
  '投資ポートフォリオのリバランスを検討してください',
  '家計簿アプリを使って支出を管理しましょう'
];

export function calculateTotalAssets(assets: Asset[]): number {
  return assets.reduce((total, asset) => total + asset.balance, 0);
}

export function calculateNetCashFlow(cashFlows: CashFlow[]): number {
  return cashFlows.reduce((total, flow) => total + flow.amount, 0);
}

export function getCashFlowsByCategory(cashFlows: CashFlow[], category: string): CashFlow[] {
  return cashFlows.filter(flow => flow.category === category);
}

if (import.meta.vitest) {
  const { test, expect, describe } = import.meta.vitest;
  
  describe('calculateTotalAssets', () => {
    test('資産の合計を計算する', () => {
      const testAssets: Asset[] = [
        { id: '1', asset_type: 'Bank', name: 'Test Bank', balance: 100000, valuation_date: '2025-01-01' },
        { id: '2', asset_type: 'Investment', name: 'Test Stock', balance: 200000, valuation_date: '2025-01-01' }
      ];
      expect(calculateTotalAssets(testAssets)).toBe(300000);
    });
    
    test('空の配列の場合は0を返す', () => {
      expect(calculateTotalAssets([])).toBe(0);
    });
    
    test('実際のモックデータで計算する', () => {
      expect(calculateTotalAssets(mockAssets)).toBe(4800000);
    });
  });
  
  describe('calculateNetCashFlow', () => {
    test('収支の合計を計算する', () => {
      const testFlows: CashFlow[] = [
        { id: '1', trans_date: '2025-01-01', category: 'Income', amount: 5000, memo: 'test' },
        { id: '2', trans_date: '2025-01-01', category: 'Expense', amount: -3000, memo: 'test' }
      ];
      expect(calculateNetCashFlow(testFlows)).toBe(2000);
    });
    
    test('実際のモックデータで計算する', () => {
      const netFlow = calculateNetCashFlow(mockCashFlows);
      expect(netFlow).toBe(494700);
    });
  });
  
  describe('getCashFlowsByCategory', () => {
    test('特定カテゴリのキャッシュフローを取得する', () => {
      const foodFlows = getCashFlowsByCategory(mockCashFlows, 'Food');
      expect(foodFlows).toHaveLength(2);
      expect(foodFlows.every(flow => flow.category === 'Food')).toBe(true);
    });
    
    test('存在しないカテゴリの場合は空配列を返す', () => {
      const flows = getCashFlowsByCategory(mockCashFlows, 'NonExistent');
      expect(flows).toHaveLength(0);
    });
  });
}