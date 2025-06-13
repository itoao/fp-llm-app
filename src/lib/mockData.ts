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