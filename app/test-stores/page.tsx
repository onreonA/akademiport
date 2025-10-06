// =====================================================
// STORE TEST PAGE
// =====================================================
// Yeni Zustand store'ları test etmek için sayfa
'use client';
import Badge from '@/lib/components/base/Badge';
import Button from '@/lib/components/base/Button';
import Card from '@/lib/components/base/Card';
import { useCompanies, useProjects } from '@/lib/hooks/use-api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useDataStore } from '@/lib/stores/data-store';
import { useUIStore } from '@/lib/stores/ui-store';
export default function TestStoresPage() {
  const { user, session, isAuthenticated, signIn, signOut } = useAuthStore();
  const {
    globalLoading,
    toasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    sidebarOpen,
    toggleSidebar,
  } = useUIStore();
  const { projects, companies, cache } = useDataStore();
  const { fetchProjects } = useProjects();
  const { fetchCompanies } = useCompanies();
  // Test authentication
  const handleLogin = async () => {
    try {
      await signIn('info@mundo.com', 'password123');
      showSuccess('Login Successful', 'You have been logged in successfully');
    } catch (error: any) {
      showError('Login Failed', error.message);
    }
  };
  const handleLogout = () => {
    signOut();
    showInfo('Logged Out', 'You have been logged out');
  };
  // Test data fetching
  const handleFetchProjects = async () => {
    try {
      await fetchProjects();
      showSuccess('Projects Loaded', `Loaded ${projects.length} projects`);
    } catch (error: any) {
      showError('Failed to Load Projects', error.message);
    }
  };
  const handleFetchCompanies = async () => {
    try {
      await fetchCompanies();
      showSuccess('Companies Loaded', `Loaded ${companies.length} companies`);
    } catch (error: any) {
      showError('Failed to Load Companies', error.message);
    }
  };
  // Test cache
  const handleTestCache = () => {
    const { setCache, getCache } = useDataStore.getState();
    setCache('test-key', { message: 'Hello from cache!' }, 10000);
    const cached = getCache('test-key');
    if (cached) {
      showSuccess('Cache Test', 'Data cached and retrieved successfully');
    }
  };
  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Store Architecture Test
          </h1>
          <p className='mt-2 text-gray-600'>
            Yeni Zustand store&apos;ları test ediyoruz
          </p>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Auth Store Test */}
          <Card>
            <div className='px-4 py-3 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Auth Store
              </h3>
              <p className='text-sm text-gray-600'>
                Authentication state management
              </p>
            </div>
            <div className='px-4 py-3'>
              <div className='space-y-4'>
                <div>
                  <p className='text-sm text-gray-600'>Status:</p>
                  <Badge variant={isAuthenticated() ? 'success' : 'warning'}>
                    {isAuthenticated() ? 'Authenticated' : 'Not Authenticated'}
                  </Badge>
                </div>
                {user && (
                  <div>
                    <p className='text-sm text-gray-600'>User:</p>
                    <p className='font-medium'>{user.email}</p>
                    <p className='text-sm text-gray-500'>Role: {user.role}</p>
                  </div>
                )}
                <div className='flex space-x-2'>
                  {!isAuthenticated() ? (
                    <Button onClick={handleLogin}>Login Test</Button>
                  ) : (
                    <Button onClick={handleLogout} variant='danger'>
                      Logout
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
          {/* UI Store Test */}
          <Card>
            <div className='px-4 py-3 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900'>UI Store</h3>
              <p className='text-sm text-gray-600'>UI state management</p>
            </div>
            <div className='px-4 py-3'>
              <div className='space-y-4'>
                <div>
                  <p className='text-sm text-gray-600'>Global Loading:</p>
                  <Badge variant={globalLoading ? 'warning' : 'success'}>
                    {globalLoading ? 'Loading' : 'Idle'}
                  </Badge>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Sidebar:</p>
                  <Badge variant={sidebarOpen ? 'success' : 'secondary'}>
                    {sidebarOpen ? 'Open' : 'Closed'}
                  </Badge>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Active Toasts:</p>
                  <Badge variant='info'>{toasts.length}</Badge>
                </div>
                <div className='flex flex-wrap gap-2'>
                  <Button
                    onClick={() =>
                      showSuccess('Success!', 'This is a success message')
                    }
                  >
                    Success Toast
                  </Button>
                  <Button
                    onClick={() =>
                      showError('Error!', 'This is an error message')
                    }
                  >
                    Error Toast
                  </Button>
                  <Button
                    onClick={() =>
                      showWarning('Warning!', 'This is a warning message')
                    }
                  >
                    Warning Toast
                  </Button>
                  <Button
                    onClick={() => showInfo('Info', 'This is an info message')}
                  >
                    Info Toast
                  </Button>
                </div>
                <Button onClick={toggleSidebar} variant='outline'>
                  Toggle Sidebar
                </Button>
              </div>
            </div>
          </Card>
          {/* Data Store Test */}
          <Card>
            <div className='px-4 py-3 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Data Store
              </h3>
              <p className='text-sm text-gray-600'>
                Data caching and management
              </p>
            </div>
            <div className='px-4 py-3'>
              <div className='space-y-4'>
                <div>
                  <p className='text-sm text-gray-600'>Projects:</p>
                  <Badge variant='info'>{projects.length}</Badge>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Companies:</p>
                  <Badge variant='info'>{companies.length}</Badge>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Cache Items:</p>
                  <Badge variant='info'>{Object.keys(cache).length}</Badge>
                </div>
                <div className='flex flex-wrap gap-2'>
                  <Button onClick={handleFetchProjects}>Fetch Projects</Button>
                  <Button onClick={handleFetchCompanies}>
                    Fetch Companies
                  </Button>
                  <Button onClick={handleTestCache} variant='outline'>
                    Test Cache
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          {/* API Hooks Test */}
          <Card>
            <div className='px-4 py-3 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900'>API Hooks</h3>
              <p className='text-sm text-gray-600'>Data fetching hooks</p>
            </div>
            <div className='px-4 py-3'>
              <div className='space-y-4'>
                <p className='text-sm text-gray-600'>
                  API hooks are integrated with stores and provide:
                </p>
                <ul className='text-sm text-gray-600 space-y-1'>
                  <li>• Automatic loading states</li>
                  <li>• Error handling</li>
                  <li>• Data caching</li>
                  <li>• Optimistic updates</li>
                </ul>
                <div className='p-3 bg-blue-50 rounded-lg'>
                  <p className='text-sm text-blue-800'>
                    <strong>Note:</strong> API hooks automatically update the
                    data store when data is fetched.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        {/* Toast Container */}
        <div className='fixed top-4 right-4 z-50 space-y-2'>
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`max-w-sm w-full p-4 rounded-lg shadow-lg ${
                toast.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : toast.type === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : toast.type === 'warning'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-blue-50 border border-blue-200'
              }`}
            >
              <div className='flex items-start'>
                <div className='flex-1'>
                  <h4
                    className={`text-sm font-medium ${
                      toast.type === 'success'
                        ? 'text-green-800'
                        : toast.type === 'error'
                          ? 'text-red-800'
                          : toast.type === 'warning'
                            ? 'text-yellow-800'
                            : 'text-blue-800'
                    }`}
                  >
                    {toast.title}
                  </h4>
                  {toast.message && (
                    <p
                      className={`text-sm mt-1 ${
                        toast.type === 'success'
                          ? 'text-green-700'
                          : toast.type === 'error'
                            ? 'text-red-700'
                            : toast.type === 'warning'
                              ? 'text-yellow-700'
                              : 'text-blue-700'
                      }`}
                    >
                      {toast.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => useUIStore.getState().removeToast(toast.id)}
                  className='ml-2 text-gray-400 hover:text-gray-600'
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
