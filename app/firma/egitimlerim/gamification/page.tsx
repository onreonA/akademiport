'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
interface UserPoints {
  id: string;
  user_id: string;
  company_id: string;
  points: number;
  total_points: number;
  level: number;
  experience_points: number;
  last_activity: string;
}
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  points: number;
  category: string;
  earned: boolean;
  earned_at?: string;
}
interface LeaderboardEntry {
  rank: number;
  user_id: string;
  user_name: string;
  user_email: string;
  points: number;
  level: number;
  experience_points: number;
  badges_count: number;
}
interface UserRank {
  rank: number;
  points: number;
  level: number;
  experience_points: number;
}
export default function GamificationDashboard() {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<
    'all' | 'month' | 'week'
  >('all');
  const fetchGamificationData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch user points
      const pointsResponse = await fetch(
        '/api/gamification/points?company_id=test-company-id',
        {
          headers: {
            'X-User-Email': 'info@mundo.com',
          },
        }
      );
      if (pointsResponse.ok) {
        const pointsResult = await pointsResponse.json();
        if (pointsResult.success) {
          setUserPoints(pointsResult.data);
        }
      }
      // Fetch badges
      const badgesResponse = await fetch(
        '/api/gamification/badges?company_id=test-company-id',
        {
          headers: {
            'X-User-Email': 'info@mundo.com',
          },
        }
      );
      if (badgesResponse.ok) {
        const badgesResult = await badgesResponse.json();
        if (badgesResult.success) {
          setBadges(badgesResult.data.badges);
        }
      }
      // Fetch leaderboard
      const leaderboardResponse = await fetch(
        `/api/gamification/leaderboard?company_id=test-company-id&period=${selectedPeriod}`,
        {
          headers: {
            'X-User-Email': 'info@mundo.com',
          },
        }
      );
      if (leaderboardResponse.ok) {
        const leaderboardResult = await leaderboardResponse.json();
        if (leaderboardResult.success) {
          setLeaderboard(leaderboardResult.data.leaderboard);
          setUserRank(leaderboardResult.data.user_rank);
        }
      }
    } catch (err) {
      setError('Gamification verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);
  useEffect(() => {
    fetchGamificationData();
  }, [fetchGamificationData]);
  const getLevelProgress = () => {
    if (!userPoints) return 0;
    const currentLevelExp = (userPoints.level - 1) * 1000;
    const nextLevelExp = userPoints.level * 1000;
    const progressInLevel = userPoints.experience_points - currentLevelExp;
    const levelRange = nextLevelExp - currentLevelExp;
    return Math.round((progressInLevel / levelRange) * 100);
  };
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };
  if (loading) {
    return (
      <FirmaLayout
        title='Gamification Dashboard'
        description='Eğitim ilerlemenizi takip edin ve rozetler kazanın'
      >
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
            <p className='text-gray-600'>Gamification verileri yükleniyor...</p>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  if (error) {
    return (
      <FirmaLayout
        title='Gamification Dashboard'
        description='Eğitim ilerlemenizi takip edin ve rozetler kazanın'
      >
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-error-warning-line text-red-600 text-2xl'></i>
            </div>
            <h3 className='text-lg font-medium text-red-900 mb-2'>
              Hata Oluştu
            </h3>
            <p className='text-red-700 mb-6'>{error}</p>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  return (
    <FirmaLayout
      title='Gamification Dashboard'
      description='Eğitim ilerlemenizi takip edin ve rozetler kazanın'
    >
      <div className='px-4 sm:px-6 lg:px-8 py-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Action Buttons */}
          <div className='flex justify-end items-center gap-4 mb-8'>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value as any)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='all'>Tüm Zamanlar</option>
              <option value='month'>Bu Ay</option>
              <option value='week'>Bu Hafta</option>
            </select>
            <button
              onClick={fetchGamificationData}
              className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
            >
              <i className='ri-refresh-line mr-2'></i>
              Yenile
            </button>
          </div>
          {/* User Stats */}
          {userPoints && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Seviye</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {userPoints.level}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                    <i className='ri-star-line text-blue-600 text-xl'></i>
                  </div>
                </div>
                <div className='mt-4'>
                  <div className='flex justify-between text-sm text-gray-600 mb-1'>
                    <span>İlerleme</span>
                    <span>{getLevelProgress()}%</span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                      style={{ width: `${getLevelProgress()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Toplam Puan
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {userPoints.total_points}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                    <i className='ri-medal-line text-green-600 text-xl'></i>
                  </div>
                </div>
              </div>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Deneyim Puanı
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {userPoints.experience_points}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                    <i className='ri-fire-line text-purple-600 text-xl'></i>
                  </div>
                </div>
              </div>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Kazanılan Rozet
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {badges.filter(b => b.earned).length}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center'>
                    <i className='ri-award-line text-yellow-600 text-xl'></i>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Badges Section */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Rozetlerim
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {badges.slice(0, 8).map(badge => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      badge.earned
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <div
                        className='w-10 h-10 rounded-lg flex items-center justify-center'
                        style={{
                          backgroundColor: badge.earned
                            ? badge.color + '20'
                            : '#f3f4f6',
                          color: badge.earned ? badge.color : '#9ca3af',
                        }}
                      >
                        <i className={`${badge.icon} text-lg`}></i>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4
                          className={`font-medium text-sm ${badge.earned ? 'text-gray-900' : 'text-gray-500'}`}
                        >
                          {badge.name}
                        </h4>
                        <p
                          className={`text-xs ${badge.earned ? 'text-gray-600' : 'text-gray-400'}`}
                        >
                          {badge.points} puan
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className='mt-4 text-center'>
                <Link
                  href='/firma/egitimlerim/gamification/badges'
                  className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                >
                  Tüm rozetleri görüntüle →
                </Link>
              </div>
            </div>
            {/* Leaderboard Section */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Liderlik Tablosu
                </h3>
                {userRank && (
                  <div className='text-sm text-gray-600'>
                    Sıralamanız:{' '}
                    <span className='font-medium text-blue-600'>
                      #{userRank.rank}
                    </span>
                  </div>
                )}
              </div>
              <div className='space-y-3'>
                {leaderboard.slice(0, 5).map(entry => (
                  <div
                    key={entry.user_id}
                    className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600'>
                        {getRankIcon(entry.rank)}
                      </div>
                      <div>
                        <div className='font-medium text-gray-900'>
                          {entry.user_name}
                        </div>
                        <div className='text-xs text-gray-600'>
                          Seviye {entry.level}
                        </div>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='font-semibold text-gray-900'>
                        {entry.points} puan
                      </div>
                      <div className='text-xs text-gray-600'>
                        {entry.badges_count} rozet
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className='mt-4 text-center'>
                <Link
                  href='/firma/egitimlerim/gamification/leaderboard'
                  className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                >
                  Tam liderlik tablosunu görüntüle →
                </Link>
              </div>
            </div>
          </div>
          {/* Recent Activity */}
          <div className='mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Son Aktiviteler
            </h3>
            <div className='space-y-4'>
              <div className='flex items-center gap-3 p-3 bg-green-50 rounded-lg'>
                <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                  <i className='ri-video-line text-green-600'></i>
                </div>
                <div className='flex-1'>
                  <div className='font-medium text-gray-900'>Video izlendi</div>
                  <div className='text-sm text-gray-600'>
                    +10 puan kazandınız
                  </div>
                </div>
                <div className='text-sm text-gray-500'>2 saat önce</div>
              </div>
              <div className='flex items-center gap-3 p-3 bg-blue-50 rounded-lg'>
                <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                  <i className='ri-medal-line text-blue-600'></i>
                </div>
                <div className='flex-1'>
                  <div className='font-medium text-gray-900'>
                    Yeni rozet kazandınız
                  </div>
                  <div className='text-sm text-gray-600'>
                    &quot;İlk Adım&quot; rozeti
                  </div>
                </div>
                <div className='text-sm text-gray-500'>1 gün önce</div>
              </div>
              <div className='flex items-center gap-3 p-3 bg-purple-50 rounded-lg'>
                <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center'>
                  <i className='ri-star-line text-purple-600'></i>
                </div>
                <div className='flex-1'>
                  <div className='font-medium text-gray-900'>
                    Seviye atladınız
                  </div>
                  <div className='text-sm text-gray-600'>
                    Seviye 2&apos;ye yükseldiniz
                  </div>
                </div>
                <div className='text-sm text-gray-500'>3 gün önce</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
