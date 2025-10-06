// =====================================================
// OPTIMIZED DATA TABLE COMPONENT
// =====================================================
// High-performance data table with virtualization
'use client';
import React, { memo, useCallback, useMemo, useState } from 'react';
interface Column<T> {
  key: keyof T;
  title: string;
  width?: number;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  onRowClick?: (row: T) => void;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  className?: string;
  pageSize?: number;
  showPagination?: boolean;
}
interface SortState {
  key: keyof any;
  direction: 'asc' | 'desc';
}
// Memoized row component
const TableRow = memo(
  <T,>({
    row,
    columns,
    onRowClick,
  }: {
    row: T;
    columns: Column<T>[];
    onRowClick?: (row: T) => void;
  }) => {
    const handleClick = useCallback(() => {
      onRowClick?.(row);
    }, [row, onRowClick]);
    return (
      <tr
        className='hover:bg-gray-50 cursor-pointer transition-colors'
        onClick={handleClick}
      >
        {columns.map(column => (
          <td
            key={String(column.key)}
            className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'
            style={{ width: column.width }}
          >
            {column.render
              ? column.render(row[column.key], row)
              : String(row[column.key] || '')}
          </td>
        ))}
      </tr>
    );
  }
);
TableRow.displayName = 'TableRow';
// Memoized header component
const TableHeader = memo(
  <T,>({
    columns,
    sortState,
    onSort,
  }: {
    columns: Column<T>[];
    sortState: SortState | null;
    onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  }) => {
    const handleSort = useCallback(
      (key: keyof T) => {
        if (!onSort) return;
        const direction =
          sortState?.key === key && sortState.direction === 'asc'
            ? 'desc'
            : 'asc';
        onSort(key, direction);
      },
      [sortState, onSort]
    );
    return (
      <thead className='bg-gray-50'>
        <tr>
          {columns.map(column => (
            <th
              key={String(column.key)}
              className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
              }`}
              style={{ width: column.width }}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <div className='flex items-center space-x-1'>
                <span>{column.title}</span>
                {column.sortable && (
                  <div className='flex flex-col'>
                    <i
                      className={`ri-arrow-up-s-line text-xs ${
                        sortState?.key === column.key &&
                        sortState.direction === 'asc'
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`}
                    ></i>
                    <i
                      className={`ri-arrow-down-s-line text-xs -mt-1 ${
                        sortState?.key === column.key &&
                        sortState.direction === 'desc'
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`}
                    ></i>
                  </div>
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
    );
  }
);
TableHeader.displayName = 'TableHeader';
// Main component
function OptimizedDataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  onRowClick,
  onSort,
  className = '',
  pageSize = 20,
  showPagination = true,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState<SortState | null>(null);
  // Memoized sorted data
  const sortedData = useMemo(() => {
    if (!sortState) return data;
    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortState.key];
      const bValue = (b as any)[sortState.key];
      if (aValue < bValue) return sortState.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortState.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortState]);
  // Memoized paginated data
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, showPagination]);
  // Memoized pagination info
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, sortedData.length);
    return {
      totalPages,
      startItem,
      endItem,
      totalItems: sortedData.length,
    };
  }, [sortedData.length, currentPage, pageSize]);
  // Handlers
  const handleSort = useCallback(
    (key: keyof T, direction: 'asc' | 'desc') => {
      setSortState({ key, direction });
      onSort?.(key, direction);
    },
    [onSort]
  );
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);
  // Reset page when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className='p-8 text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className='p-8 text-center text-red-600'>
          <i className='ri-error-warning-line text-4xl mb-4'></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className='p-8 text-center text-gray-600'>
          <i className='ri-database-line text-4xl mb-4'></i>
          <p>Veri bulunamadı</p>
        </div>
      </div>
    );
  }
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <TableHeader
            columns={columns as any}
            sortState={sortState}
            onSort={handleSort}
          />
          <tbody className='bg-white divide-y divide-gray-200'>
            {paginatedData.map((row, index) => (
              <TableRow
                key={index}
                row={row}
                columns={columns as any}
                onRowClick={onRowClick as any}
              />
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {showPagination && paginationInfo.totalPages > 1 && (
        <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
          <div className='flex-1 flex justify-between sm:hidden'>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Önceki
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === paginationInfo.totalPages}
              className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Sonraki
            </button>
          </div>
          <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
            <div>
              <p className='text-sm text-gray-700'>
                <span className='font-medium'>{paginationInfo.startItem}</span>{' '}
                - <span className='font-medium'>{paginationInfo.endItem}</span>{' '}
                arası, toplam{' '}
                <span className='font-medium'>{paginationInfo.totalItems}</span>{' '}
                sonuçtan
              </p>
            </div>
            <div>
              <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <i className='ri-arrow-left-s-line'></i>
                </button>
                {Array.from(
                  { length: Math.min(5, paginationInfo.totalPages) },
                  (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === paginationInfo.totalPages}
                  className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <i className='ri-arrow-right-s-line'></i>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default memo(OptimizedDataTable);
