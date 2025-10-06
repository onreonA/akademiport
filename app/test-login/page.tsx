'use client';
import { useState } from 'react';

import { useAuthStore } from '@/lib/stores/auth-store';
export default function TestLoginPage() {
  const [email, setEmail] = useState('info@mundo.com');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const { signIn, user, session } = useAuthStore();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      setResult(null);
      await signIn(email, password);
      setResult({ success: true, user, session });
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className='min-h-screen bg-gray-100 p-8'>
      <div className='max-w-md mx-auto bg-white rounded-lg shadow-md p-6'>
        <h1 className='text-2xl font-bold mb-6'>Test Login</h1>
        <form onSubmit={handleLogin} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Email
            </label>
            <input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Password
            </label>
            <input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
              {error}
            </div>
          )}
          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md'
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {result && (
          <div className='mt-6 p-4 bg-green-50 border border-green-200 rounded-md'>
            <h3 className='font-semibold text-green-800 mb-2'>
              Login Successful!
            </h3>
            <pre className='text-xs text-green-700 overflow-auto'>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        <div className='mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md'>
          <h3 className='font-semibold text-gray-800 mb-2'>Current State:</h3>
          <pre className='text-xs text-gray-700 overflow-auto'>
            {JSON.stringify({ user, session }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
