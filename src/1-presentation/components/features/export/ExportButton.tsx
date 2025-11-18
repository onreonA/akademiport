/**
 * Export Button Component
 *
 * Dashboard ve raporlar için export butonu
 */

'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/atoms/dropdown-menu';
import { Download, FileText, FileSpreadsheet, File, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface ExportButtonProps {
  exportUrl: string;
  filename?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ExportButton({
  exportUrl,
  filename,
  className,
  variant = 'outline',
  size = 'default',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      setIsExporting(format);
      const url = `${exportUrl}${exportUrl.includes('?') ? '&' : '?'}format=${format}`;

      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Export başarısız' }));
        throw new Error(error.error || 'Export başarısız');
      }

      // Get filename from Content-Disposition header or use provided filename
      const contentDisposition = response.headers.get('Content-Disposition');
      let downloadFilename = filename || 'export';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          downloadFilename = filenameMatch[1];
        }
      } else {
        downloadFilename = `${filename || 'export'}.${format === 'excel' ? 'xlsx' : format}`;
      }

      // Create blob and download
      const blob = await response.blob();
      const url_blob = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url_blob;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url_blob);

      toast.success(`${format.toUpperCase()} export başarılı`);
    } catch (error: any) {
      toast.error(error.message || 'Export başarısız');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={!!isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Export ediliyor...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')} disabled={isExporting === 'pdf'}>
          <FileText className="mr-2 h-4 w-4" />
          PDF olarak export et
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')} disabled={isExporting === 'excel'}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel olarak export et
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')} disabled={isExporting === 'csv'}>
          <File className="mr-2 h-4 w-4" />
          CSV olarak export et
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
