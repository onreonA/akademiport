'use client';
import { useState, useEffect } from 'react';
interface LeaderboardEntry {
  user_email: string;
  current_level: number;
  current_points: number;
  total_points_earned: number;
  achievements_count: number;
}
interface LeaderboardProps {
  userEmail: string;
}
export default function Leaderboard({ userEmail }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  useEffect(() => {
    fetchLeaderboard();
  }, []);
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leaderboard', {
        headers: {
          'X-User-Email': userEmail,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Liderlik tablosu getirilemedi');
      }
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.data.leaderboard);
        setUserRank(data.data.userRank);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Liderlik tablosu yüklenemedi');
    } finally {
      setLoading(false);
    }
  };
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return 'ri-crown-line text-yellow-500';
      case 2:
        return 'ri-medal-line text-gray-400';
      case 3:
        return 'ri-award-line text-orange-500';
      default:
        return 'ri-number-line text-gray-400';
    }
  };
  const getLevelColor = (level: number) => {
    if (level >= 8) return 'text-purple-600';
    if (level >= 5) return 'text-blue-600';
    if (level >= 3) return 'text-green-600';
    return 'text-gray-600';
  };
  if (loading) {
    return (
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
        <div className='flex items-center justify-center py-8'>
          <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
            <i className='ri-loader-4-line text-xl text-blue-600 animate-spin'></i>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
        <div className='text-center py-8'>
          <i className='ri-error-warning-line text-3xl text-red-500 mb-4'></i>
          <p className='text-gray-600'>{error}</p>
        </div>
      </div>
    );
  }
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Liderlik Tablosu
        </h3>
        {userRank && (
          <div className='text-sm text-gray-600'>
            Senin sıralaman:{' '}
            <span className='font-semibold text-blue-600'>#{userRank}</span>
          </div>
        )}
      </div>
      {leaderboard.length === 0 ? (
        <div className='text-center py-8'>
          <i className='ri-trophy-line text-3xl text-gray-300 mb-4'></i>
          <p className='text-gray-500'>Henüz liderlik tablosu oluşmadı</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {leaderboard.map((entry, index) => (
            <div
              key={entry.user_email}
              className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                entry.user_email === userEmail
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className='flex items-center space-x-4'>
                <div className='flex-shrink-0 w-8 h-8 flex items-center justify-center'>
                  {index < 3 ? (
                    <i className={`${getRankIcon(index + 1)} text-xl`}></i>
                  ) : (
                    <span className='text-sm font-semibold text-gray-600'>
                      #{index + 1}
                    </span>
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center space-x-2'>
                    <p className='text-sm font-medium text-gray-900 truncate'>
                      {entry.user_email}
                    </p>
                    {entry.user_email === userEmail && (
                      <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                        Sen
                      </span>
                    )}
                  </div>
                  <div className='flex items-center space-x-4 mt-1'>
                    <span
                      className={`text-sm font-semibold ${getLevelColor(entry.current_level)}`}
                    >
                      Seviye {entry.current_level}
                    </span>
                    <span className='text-sm text-gray-500'>
                      {entry.achievements_count} başarım
                    </span>
                  </div>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-lg font-bold text-gray-900'>
                  {entry.current_points}
                </p>
                <p className='text-xs text-gray-500'>puan</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
