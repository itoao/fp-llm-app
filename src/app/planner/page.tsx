'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  data?: any;
}

interface LifeEvent {
  id: string;
  event_name: string;
  target_date: string;
  required_amount: number;
  priority: 'high' | 'medium' | 'low';
  current_savings: number;
  description?: string;
}

export default function PlannerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usageCount, setUsageCount] = useState(0);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadUserData = () => {
    const profile = localStorage.getItem('userProfile');
    const events = localStorage.getItem('lifeEvents');
    const usage = localStorage.getItem('mockUsageCount');
    
    if (profile) setUserProfile(JSON.parse(profile));
    if (events) setLifeEvents(JSON.parse(events));
    if (usage) setUsageCount(Number(usage));
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadUserData();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer mock-token`,
        },
        body: JSON.stringify({
          prompt: input,
          context: {
            user_profile: userProfile,
            life_events: lifeEvents,
          },
        }),
      });

      const data = await response.json();

      if (response.status === 402) {
        setError('無料利用回数に達しました。続けるには有料プランにアップグレードしてください。');
        const systemMessage: Message = {
          id: Date.now().toString(),
          role: 'system',
          content: '無料利用回数（3回）に達しました。続けて利用するには有料プランにアップグレードしてください。',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, systemMessage]);
      } else if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      } else {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.response || 'ファイナンシャルプランニングについてお手伝いします。何を知りたいですか？',
          timestamp: new Date(),
          suggestions: data.suggestions,
          data: data.data,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        
        const newUsageCount = usageCount + 1;
        setUsageCount(newUsageCount);
        localStorage.setItem('mockUsageCount', newUsageCount.toString());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'メッセージの送信に失敗しました');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">💰 AI ファイナンシャルプランナー</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              利用回数: {usageCount}/3 (無料)
            </span>
            <button
              onClick={() => router.push('/life-events')}
              className="text-sm text-green-600 hover:text-green-500"
            >
              ライフイベント管理
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ダッシュボードに戻る
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 AI ファイナンシャルプランナーへようこそ！</h2>
                  <p className="text-gray-600 mb-4">あなたのライフイベントに向けた資金戦略をサポートします</p>
                </div>
                
                {lifeEvents.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">📋 登録済みライフイベント</h3>
                    <div className="text-sm text-blue-800 space-y-1">
                      {lifeEvents.slice(0, 3).map((event) => (
                        <div key={event.id} className="flex justify-between">
                          <span>{event.event_name}</span>
                          <span>¥{event.required_amount.toLocaleString()}</span>
                        </div>
                      ))}
                      {lifeEvents.length > 3 && (
                        <div className="text-blue-600">他 {lifeEvents.length - 3} 件...</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  <button
                    onClick={() => setInput('結婚資金300万円を2年で貯めたいです。どうすればいいですか？')}
                    className="p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 text-left"
                  >
                    <div className="font-medium text-green-800">💒 結婚資金の相談</div>
                    <div className="text-sm text-green-600">短期目標の貯蓄戦略</div>
                  </button>
                  <button
                    onClick={() => setInput('住宅購入の頭金を効率的に貯める方法を教えてください')}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 text-left"
                  >
                    <div className="font-medium text-blue-800">🏠 住宅購入資金</div>
                    <div className="text-sm text-blue-600">大きな目標の資金計画</div>
                  </button>
                  <button
                    onClick={() => setInput('教育資金を計画的に貯めたいです')}
                    className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 text-left"
                  >
                    <div className="font-medium text-purple-800">📚 教育資金</div>
                    <div className="text-sm text-purple-600">長期的な教育投資</div>
                  </button>
                  <button
                    onClick={() => setInput('老後資金について基本的なことから教えてください')}
                    className="p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 text-left"
                  >
                    <div className="font-medium text-orange-800">👴 老後資金</div>
                    <div className="text-sm text-orange-600">将来への備え</div>
                  </button>
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className="space-y-4">
                <div
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.role === 'system'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                {/* AIの回答に追加の提案を表示 */}
                {message.role === 'assistant' && message.suggestions && (
                  <div className="flex justify-start">
                    <div className="max-w-2xl">
                      <div className="text-sm text-gray-600 mb-2">💡 関連する学習ポイント:</div>
                      <div className="space-y-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setInput(suggestion)}
                            className="block w-full text-left p-2 bg-blue-50 hover:bg-blue-100 rounded text-sm text-blue-800 border border-blue-200"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="px-6 py-3 bg-red-50 border-t border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ライフイベントの資金計画について質問してください..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading || usageCount >= 3}
              />
              <button
                type="submit"
                disabled={loading || !input.trim() || usageCount >= 3}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '送信中...' : '送信'}
              </button>
            </div>
            {usageCount >= 3 && (
              <div className="mt-2 text-center">
                <div className="text-sm text-red-600 mb-2">無料利用回数に達しました</div>
                <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                  有料プランにアップグレード
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}