'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface LifeEvent {
  id: string;
  event_name: string;
  target_date: string;
  required_amount: number;
  priority: 'high' | 'medium' | 'low';
  current_savings: number;
  description?: string;
}

const PRESET_EVENTS = [
  { name: '結婚', amount: 3000000, description: '結婚式・新婚旅行・新生活準備' },
  { name: '住宅購入', amount: 6000000, description: '頭金・諸費用' },
  { name: '出産・育児', amount: 1000000, description: '出産費用・育児用品' },
  { name: '子供の教育費', amount: 5000000, description: '大学までの教育費' },
  { name: '車の購入', amount: 2500000, description: '新車購入費用' },
  { name: '海外旅行', amount: 500000, description: 'ヨーロッパ旅行' },
  { name: '退職・老後資金', amount: 30000000, description: '老後の生活資金' },
];

export default function LifeEventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LifeEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<LifeEvent>>({
    event_name: '',
    target_date: '',
    required_amount: 0,
    priority: 'medium',
    current_savings: 0,
    description: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadLifeEvents();
  }, [user, router]);

  const loadLifeEvents = () => {
    const stored = localStorage.getItem('lifeEvents');
    if (stored) {
      setLifeEvents(JSON.parse(stored));
    }
  };

  const saveLifeEvents = (events: LifeEvent[]) => {
    localStorage.setItem('lifeEvents', JSON.stringify(events));
    setLifeEvents(events);
  };

  const handleAddEvent = () => {
    if (!newEvent.event_name || !newEvent.target_date || !newEvent.required_amount) {
      return;
    }

    const event: LifeEvent = {
      id: Date.now().toString(),
      event_name: newEvent.event_name!,
      target_date: newEvent.target_date!,
      required_amount: newEvent.required_amount!,
      priority: newEvent.priority!,
      current_savings: newEvent.current_savings || 0,
      description: newEvent.description,
    };

    saveLifeEvents([...lifeEvents, event]);
    setNewEvent({
      event_name: '',
      target_date: '',
      required_amount: 0,
      priority: 'medium',
      current_savings: 0,
      description: '',
    });
    setShowAddForm(false);
  };

  const handleUpdateEvent = () => {
    if (!editingEvent) return;

    const updatedEvents = lifeEvents.map(event =>
      event.id === editingEvent.id ? editingEvent : event
    );
    saveLifeEvents(updatedEvents);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    const updatedEvents = lifeEvents.filter(event => event.id !== id);
    saveLifeEvents(updatedEvents);
  };

  const usePresetEvent = (preset: typeof PRESET_EVENTS[0]) => {
    setNewEvent({
      ...newEvent,
      event_name: preset.name,
      required_amount: preset.amount,
      description: preset.description,
    });
  };

  const calculateMonthsToTarget = (targetDate: string) => {
    const target = new Date(targetDate);
    const now = new Date();
    const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    return Math.max(0, months);
  };

  const calculateMonthlySavingsNeeded = (event: LifeEvent) => {
    const months = calculateMonthsToTarget(event.target_date);
    const remainingAmount = event.required_amount - event.current_savings;
    return months > 0 ? Math.ceil(remainingAmount / months) : remainingAmount;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '-';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ライフイベント管理</h1>
            <p className="text-gray-600 mt-2">人生の目標に向けた資金計画を立てましょう</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + 新しい目標を追加
          </button>
        </div>

        {/* ライフイベント一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {lifeEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{event.event_name}</h3>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(event.priority)}`}>
                    優先度{getPriorityLabel(event.priority)}
                  </span>
                  <button
                    onClick={() => setEditingEvent(event)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    削除
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">目標時期:</span>
                  <span className="font-medium">{new Date(event.target_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">必要資金:</span>
                  <span className="font-medium">¥{event.required_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">現在の貯蓄:</span>
                  <span className="font-medium">¥{event.current_savings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">月間必要額:</span>
                  <span className="font-bold text-blue-600">¥{calculateMonthlySavingsNeeded(event).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">残り期間:</span>
                  <span className="font-medium">{calculateMonthsToTarget(event.target_date)}ヶ月</span>
                </div>

                {/* 進捗バー */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>進捗</span>
                    <span>{Math.round((event.current_savings / event.required_amount) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min((event.current_savings / event.required_amount) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {lifeEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">まだライフイベントが登録されていません</div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              最初の目標を追加する
            </button>
          </div>
        )}

        {/* 新規追加フォーム */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">新しいライフイベントを追加</h2>
                
                {/* プリセット選択 */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">よくある目標から選択:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_EVENTS.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => usePresetEvent(preset)}
                        className="text-left p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300"
                      >
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-sm text-gray-600">¥{preset.amount.toLocaleString()}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">目標名</label>
                    <input
                      type="text"
                      value={newEvent.event_name}
                      onChange={(e) => setNewEvent({...newEvent, event_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 結婚"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">目標時期</label>
                    <input
                      type="date"
                      value={newEvent.target_date}
                      onChange={(e) => setNewEvent({...newEvent, target_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">必要資金</label>
                    <input
                      type="number"
                      value={newEvent.required_amount}
                      onChange={(e) => setNewEvent({...newEvent, required_amount: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="3000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">現在の貯蓄額</label>
                    <input
                      type="number"
                      value={newEvent.current_savings}
                      onChange={(e) => setNewEvent({...newEvent, current_savings: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="500000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
                    <select
                      value={newEvent.priority}
                      onChange={(e) => setNewEvent({...newEvent, priority: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="high">高</option>
                      <option value="medium">中</option>
                      <option value="low">低</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="詳細な説明や注意事項"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleAddEvent}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 編集フォーム */}
        {editingEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">ライフイベントを編集</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">目標名</label>
                    <input
                      type="text"
                      value={editingEvent.event_name}
                      onChange={(e) => setEditingEvent({...editingEvent, event_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">目標時期</label>
                    <input
                      type="date"
                      value={editingEvent.target_date}
                      onChange={(e) => setEditingEvent({...editingEvent, target_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">必要資金</label>
                    <input
                      type="number"
                      value={editingEvent.required_amount}
                      onChange={(e) => setEditingEvent({...editingEvent, required_amount: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">現在の貯蓄額</label>
                    <input
                      type="number"
                      value={editingEvent.current_savings}
                      onChange={(e) => setEditingEvent({...editingEvent, current_savings: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
                    <select
                      value={editingEvent.priority}
                      onChange={(e) => setEditingEvent({...editingEvent, priority: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="high">高</option>
                      <option value="medium">中</option>
                      <option value="low">低</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
                    <textarea
                      value={editingEvent.description}
                      onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setEditingEvent(null)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleUpdateEvent}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    更新
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AIアドバイスボタン */}
        {lifeEvents.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => router.push('/planner')}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
            >
              AIに資金戦略を相談する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}