'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
interface Document {
  id: string;
  title: string;
  file_type: string;
  status: string;
  created_at: string;
}
interface Company {
  id: string;
  name: string;
  email: string;
  status: string;
}
export default function DocumentAssignmentPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch documents
      const documentsResponse = await fetch('/api/documents', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (documentsResponse.ok) {
        const documentsResult = await documentsResponse.json();
        if (documentsResult.success) {
          setDocuments(documentsResult.data || []);
        }
      }
      // Fetch companies
      const companiesResponse = await fetch('/api/companies', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (companiesResponse.ok) {
        const companiesResult = await companiesResponse.json();
        if (companiesResult.success) {
          setCompanies(companiesResult.companies || []);
        }
      }
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  const handleAssign = async () => {
    if (!selectedDocument) {
      setError('Lütfen bir döküman seçin');
      return;
    }
    if (selectedCompanies.length === 0) {
      setError('Lütfen en az bir firma seçin');
      return;
    }
    try {
      setAssigning(true);
      setError(null);
      setSuccess(null);
      const response = await fetch('/api/documents/assign', {
        method: 'POST',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: selectedDocument,
          company_ids: selectedCompanies,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(result.data.message);
        setSelectedCompanies([]);
        setSelectedDocument('');
      } else {
        setError(result.error || 'Atama işlemi başarısız');
      }
    } catch (err) {
      setError('Atama işlemi sırasında hata oluştu');
    } finally {
      setAssigning(false);
    }
  };
  const handleAssignAll = async () => {
    if (!selectedDocument) {
      setError('Lütfen bir döküman seçin');
      return;
    }
    try {
      setAssigning(true);
      setError(null);
      setSuccess(null);
      const response = await fetch('/api/documents/assign', {
        method: 'POST',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: selectedDocument,
          assign_all: true,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(result.data.message);
        setSelectedCompanies([]);
        setSelectedDocument('');
      } else {
        setError(result.error || 'Toplu atama işlemi başarısız');
      }
    } catch (err) {
      setError('Toplu atama işlemi sırasında hata oluştu');
    } finally {
      setAssigning(false);
    }
  };
  const toggleCompany = (companyId: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };
  const activeCompanies = companies.filter(
    company => company.status === 'active'
  );
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }
  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center gap-6'>
              <Link
                href='/admin/egitim-yonetimi/dokumanlar'
                className='flex items-center gap-2 text-gray-600 hover:text-blue-600'
              >
                <i className='ri-arrow-left-line'></i>
                <span>Geri Dön</span>
              </Link>
              <nav className='hidden md:flex items-center text-sm text-gray-500'>
                <Link
                  href='/admin'
                  className='hover:text-blue-600 cursor-pointer'
                >
                  Ana Panel
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <Link
                  href='/admin/egitim-yonetimi/dokumanlar'
                  className='hover:text-blue-600 cursor-pointer'
                >
                  Dökümanlar
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <span className='text-gray-900 font-medium'>Firma Atama</span>
              </nav>
            </div>
          </div>
        </div>
      </header>
      <div className='px-4 sm:px-6 lg:px-8 py-8'>
        <div className='max-w-6xl mx-auto'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Döküman Firma Atama
            </h1>
            <p className='text-gray-600'>
              Dökümanları firmalara atayın ve erişim sağlayın
            </p>
          </div>
          {error && (
            <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
              <div className='flex items-center gap-2'>
                <i className='ri-error-warning-line text-red-600'></i>
                <p className='text-red-800'>{error}</p>
              </div>
            </div>
          )}
          {success && (
            <div className='mb-6 bg-green-50 border border-green-200 rounded-lg p-4'>
              <div className='flex items-center gap-2'>
                <i className='ri-check-line text-green-600'></i>
                <p className='text-green-800'>{success}</p>
              </div>
            </div>
          )}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Document Selection */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Döküman Seçimi
              </h3>
              <div className='space-y-3'>
                {documents.map(doc => (
                  <label
                    key={doc.id}
                    className='flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer'
                  >
                    <input
                      type='radio'
                      name='document'
                      value={doc.id}
                      checked={selectedDocument === doc.id}
                      onChange={e => setSelectedDocument(e.target.value)}
                      className='text-blue-600 focus:ring-blue-500'
                    />
                    <div className='flex-1'>
                      <p className='font-medium text-gray-900'>{doc.title}</p>
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'>
                          {doc.file_type.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            doc.status === 'Aktif'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {documents.length === 0 && (
                <div className='text-center py-8'>
                  <i className='ri-file-text-line text-gray-400 text-4xl mb-4'></i>
                  <p className='text-gray-500'>Henüz döküman bulunmuyor</p>
                </div>
              )}
            </div>
            {/* Company Selection */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Firma Seçimi
                </h3>
                <button
                  onClick={handleAssignAll}
                  disabled={!selectedDocument || assigning}
                  className='bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors'
                >
                  Tümüne Ata
                </button>
              </div>
              <div className='space-y-3 max-h-96 overflow-y-auto'>
                {activeCompanies.map(company => (
                  <label
                    key={company.id}
                    className='flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={selectedCompanies.includes(company.id)}
                      onChange={() => toggleCompany(company.id)}
                      className='text-blue-600 focus:ring-blue-500 rounded'
                    />
                    <div className='flex-1'>
                      <p className='font-medium text-gray-900'>
                        {company.name}
                      </p>
                      <p className='text-sm text-gray-600'>{company.email}</p>
                    </div>
                    <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs'>
                      Aktif
                    </span>
                  </label>
                ))}
              </div>
              {activeCompanies.length === 0 && (
                <div className='text-center py-8'>
                  <i className='ri-building-line text-gray-400 text-4xl mb-4'></i>
                  <p className='text-gray-500'>Aktif firma bulunmuyor</p>
                </div>
              )}
              <div className='mt-4 pt-4 border-t border-gray-200'>
                <div className='flex items-center justify-between text-sm text-gray-600'>
                  <span>Seçili Firma: {selectedCompanies.length}</span>
                  <span>Toplam Aktif: {activeCompanies.length}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className='mt-8 flex justify-center'>
            <button
              onClick={handleAssign}
              disabled={
                !selectedDocument || selectedCompanies.length === 0 || assigning
              }
              className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2'
            >
              {assigning ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  Atanıyor...
                </>
              ) : (
                <>
                  <i className='ri-user-add-line'></i>
                  Seçili Firmalara Ata
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
