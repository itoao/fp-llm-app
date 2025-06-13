'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  name: string;
  age: number;
  annual_income: number;
  family_structure: string;
  financial_knowledge_level: 'beginner' | 'intermediate' | 'advanced';
  monthly_expenses: number;
  current_savings: number;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: 25,
    annual_income: 4000000,
    family_structure: '独身',
    financial_knowledge_level: 'beginner',
    monthly_expenses: 200000,
    current_savings: 500000,
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // プロフィール保存してダッシュボードへ
      localStorage.setItem('userProfile', JSON.stringify(profile));
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>ステップ {step} / 4</span>
            <span>{Math.round((step / 4) * 100)}% 完了</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">基本情報を教えてください</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    お名前
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="山田太郎"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    年齢
                  </label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({...profile, age: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    家族構成
                  </label>
                  <select
                    value={profile.family_structure}
                    onChange={(e) => setProfile({...profile, family_structure: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="独身">独身</option>
                    <option value="既婚（子供なし）">既婚（子供なし）</option>
                    <option value="既婚（子供1人）">既婚（子供1人）</option>
                    <option value="既婚（子供2人以上）">既婚（子供2人以上）</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">収入について教えてください</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    年収（税込み）
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={profile.annual_income}
                      onChange={(e) => setProfile({...profile, annual_income: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">円</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    月収換算：約{Math.round(profile.annual_income / 12).toLocaleString()}円
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    月間支出（概算）
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={profile.monthly_expenses}
                      onChange={(e) => setProfile({...profile, monthly_expenses: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">円</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    家賃、食費、光熱費、通信費など全ての支出を含む
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">現在の資産状況</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    現在の貯蓄額
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={profile.current_savings}
                      onChange={(e) => setProfile({...profile, current_savings: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">円</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    預金、投資、保険の解約返戻金など、すぐに使える資産の合計
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">現在の家計状況</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>月収（手取り概算）: {Math.round(profile.annual_income / 12 * 0.8).toLocaleString()}円</p>
                    <p>月間支出: {profile.monthly_expenses.toLocaleString()}円</p>
                    <p>月間余剰: {Math.round(profile.annual_income / 12 * 0.8 - profile.monthly_expenses).toLocaleString()}円</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">金融知識レベル</h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  あなたの金融知識レベルを選択してください。これにより、最適な学習コンテンツを提供します。
                </p>
                <div className="space-y-3">
                  {[
                    { value: 'beginner', label: '初心者', desc: '貯金以外の資産運用はほとんど経験がない' },
                    { value: 'intermediate', label: '中級者', desc: 'NISA・iDeCoなど基本的な制度は知っている' },
                    { value: 'advanced', label: '上級者', desc: '投資経験があり、リスク管理も理解している' }
                  ].map((level) => (
                    <label key={level.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="knowledge_level"
                        value={level.value}
                        checked={profile.financial_knowledge_level === level.value}
                        onChange={(e) => setProfile({...profile, financial_knowledge_level: e.target.value as any})}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{level.label}</div>
                        <div className="text-sm text-gray-600">{level.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ナビゲーションボタン */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              戻る
            </button>
            <button
              onClick={handleNext}
              disabled={step === 1 && !profile.name}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 4 ? '完了' : '次へ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}