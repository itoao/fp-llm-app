'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { mockCashFlows, mockAssets, type CashFlow, type Asset } from '@/lib/mockData';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchFinancialData();
    }
  }, [user, authLoading, router]);

  const fetchFinancialData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCashFlows(mockCashFlows);
      setAssets(mockAssets);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAssets = () => {
    return assets.reduce((sum, asset) => sum + Number(asset.balance), 0);
  };

  const calculateMonthlyIncome = () => {
    const thisMonth = new Date().getMonth();
    return cashFlows
      .filter(cf => new Date(cf.trans_date).getMonth() === thisMonth && Number(cf.amount) > 0)
      .reduce((sum, cf) => sum + Number(cf.amount), 0);
  };

  const calculateMonthlyExpenses = () => {
    const thisMonth = new Date().getMonth();
    return Math.abs(
      cashFlows
        .filter(cf => new Date(cf.trans_date).getMonth() === thisMonth && Number(cf.amount) < 0)
        .reduce((sum, cf) => sum + Number(cf.amount), 0)
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user?.user_metadata?.name || user?.email}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Total Assets</h2>
            <p className="text-3xl font-bold text-gray-900">¥{calculateTotalAssets().toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Monthly Income</h2>
            <p className="text-3xl font-bold text-green-600">¥{calculateMonthlyIncome().toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Monthly Expenses</h2>
            <p className="text-3xl font-bold text-red-600">¥{calculateMonthlyExpenses().toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {cashFlows.length === 0 ? (
                <p className="px-6 py-4 text-gray-500">No transactions yet</p>
              ) : (
                cashFlows.map((cf) => (
                  <div key={cf.id} className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{cf.category}</p>
                        <p className="text-sm text-gray-500">{cf.memo || 'No description'}</p>
                        <p className="text-xs text-gray-400">{new Date(cf.trans_date).toLocaleDateString()}</p>
                      </div>
                      <p className={`font-semibold ${Number(cf.amount) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Number(cf.amount) > 0 ? '+' : ''}¥{Math.abs(Number(cf.amount)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Assets</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {assets.length === 0 ? (
                <p className="px-6 py-4 text-gray-500">No assets recorded</p>
              ) : (
                assets.map((asset) => (
                  <div key={asset.id} className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{asset.name}</p>
                        <p className="text-sm text-gray-500">{asset.asset_type}</p>
                        <p className="text-xs text-gray-400">As of {new Date(asset.valuation_date).toLocaleDateString()}</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ¥{Number(asset.balance).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => router.push('/onboarding')}
            className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            📝 プロフィール設定
          </button>
          <button
            onClick={() => router.push('/life-events')}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            🎯 ライフイベント管理
          </button>
          <button
            onClick={() => router.push('/planner')}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            💰 AI プランナー
          </button>
        </div>
      </div>
    </div>
  );
}