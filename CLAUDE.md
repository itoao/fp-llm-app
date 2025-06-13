# 財務プランニング AI アプリ 要件定義

## システム概要

### 基本構成
- **技術スタック**: Next.js + Supabase + Mastra(AI) + Stripe
- **ビジネスモデル**: 3回無料利用 → 有料課金
- **デプロイ**: Vercel (予定)

### 現在の実装状況
- モック認証システム実装済み
- モック財務データ作成済み
- API エンドポイント（/simulate）モック実装済み
- 基本的なダッシュボード画面実装済み

## ターゲット・コンセプト

### ターゲットユーザー
- **主要ターゲット**: 金融リテラシーを上げたい人
- **学習レベル**: 初心者〜中級者
- **ニーズ**: 実践的な金融知識と具体的なアクションプラン

### AIの役割
- **メイン機能**: ライフイベントに対する資金調達戦略の教育的アドバイス
- **特徴**: 
  - あくまで教育目的（金融商品の具体的推奨は避ける）
  - ユーザーのコンテクスト（年齢、収入、家族構成等）に応じたパーソナライズ
  - 計算方法や考え方の原理を教える

## 必要データ構造

### 1. ユーザー基本情報
```typescript
interface User {
  id: string;
  email: string;
  profile: {
    name: string;
    age: number;
    annual_income: number;
    family_structure: string; // 独身、既婚、子供有無等
    financial_knowledge_level: 'beginner' | 'intermediate' | 'advanced';
  }
}
```

### 2. ライフイベント情報
```typescript
interface LifeEvent {
  id: string;
  user_id: string;
  event_name: string; // 結婚、住宅購入、教育、退職等
  target_date: Date;
  required_amount: number;
  priority: 'high' | 'medium' | 'low';
  current_savings: number;
  description?: string;
}
```

### 3. 財務状況
```typescript
interface FinancialStatus {
  id: string;
  user_id: string;
  monthly_income: number;
  monthly_expenses: {
    fixed_costs: number;    // 固定費
    variable_costs: number; // 変動費
  };
  current_assets: {
    cash: number;           // 現金・預金
    investments: number;    // 投資
    other: number;         // その他
  };
  debts: number;
  updated_at: Date;
}
```

### 4. AI会話履歴
```typescript
interface Conversation {
  id: string;
  user_id: string;
  message: string;
  ai_response: string;
  context: {
    life_events: LifeEvent[];
    financial_status: FinancialStatus;
  };
  created_at: Date;
}
```

## AIアドバイス方針

### ✅ 提供可能な教育内容
- **概念・原理の説明**: 複利、インフレ、リスクとリターンの関係
- **計算方法の教育**: 将来価値計算、72の法則、実質金利計算
- **一般的な戦略パターン**: 短期 vs 長期目標、年代別資産配分の考え方
- **パーソナライズされた計算**: ユーザーの収入・目標に基づいた必要貯蓄額
- **制度説明**: NISA、iDeCo等の制度概要（商品推奨なし）

### ❌ 避けるべき内容
- 具体的な金融機関名・商品名の推奨
- 個別株式の推奨
- 投資アドバイス（免許が必要）

### AIアドバイス例
**結婚資金300万円、2年後、25歳年収400万円の場合:**
```
【計算を学ぼう】
300万円 ÷ 24ヶ月 = 月12.5万円の貯蓄が必要です

【あなたの状況での学習ポイント】
・手取り月収の約40%を貯蓄に回す計算になります
・この貯蓄率は一般的に高めです（若い世代の平均は15-20%）

【選択肢の考え方】
・短期目標（2年）→ 元本割れリスクを避ける考え方
・元本保証型商品の特徴とメリット・デメリット

【検討の視点】
・家計の固定費見直しの重要性
・副収入の可能性も検討材料に
```

## 次のステップ（未決定事項）

### 機能要件詳細化
- ユーザーオンボーディングフロー
- ライフイベント設定UI
- AIチャット機能の詳細
- 学習履歴・進捗管理

### 技術要件
- データベース設計の詳細
- AI（Mastra）の具体的な実装方針
- 認証システムの本格実装
- Stripe決済の実装

### UX/UI設計
- 画面設計・ワイヤーフレーム
- 教育コンテンツの表示方法
- モバイル対応

---

## 開発メモ

### 現在のモック実装
- 認証: `src/hooks/useAuth.tsx` - モックユーザーデータ
- API: `src/api/edge-functions.ts` - モック財務データとAIレスポンス
- データ: `src/lib/mockData.ts` - 日本語サンプルデータ
- UI: ダッシュボード、ログイン、サインアップページ基本実装

### 実行コマンド
```bash
npm run dev    # 開発サーバー起動
npm run build  # ビルド
npm run lint   # リント実行
```