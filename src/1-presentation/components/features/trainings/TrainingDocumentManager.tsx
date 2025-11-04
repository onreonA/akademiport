'use client';

/**
 * Training Document Manager Component
 *
 * Component for managing training documents (list, add, edit, delete)
 */

import * as React from 'react';
import { Plus, Edit, Trash2, FileText, Lock, Download } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/atoms/dialog';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Label } from '@/presentation/components/ui/atoms/label';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import { Checkbox } from '@/presentation/components/ui/atoms/checkbox';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { FileUpload } from './FileUpload';
import { toast } from 'sonner';
import type { TrainingDocument } from '@/domain/entities/TrainingDocument';

interface TrainingDocumentManagerProps {
  trainingId: string;
  documents: TrainingDocument[];
  onRefresh: () => void;
}

export function TrainingDocumentManager({
  trainingId,
  documents: initialDocuments,
  onRefresh,
}: TrainingDocumentManagerProps) {
  const [documents, setDocuments] = React.useState<TrainingDocument[]>(initialDocuments);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingDocument, setEditingDocument] = React.useState<TrainingDocument | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadedFile, setUploadedFile] = React.useState<{
    url: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  } | null>(null);
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    orderIndex: 0,
    isLocked: false,
  });

  React.useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  const handleOpenAddModal = () => {
    // Calculate next orderIndex: max existing orderIndex + 1, or 0 if no documents
    const maxOrderIndex =
      documents.length > 0 ? Math.max(...documents.map((d) => d.orderIndex ?? 0)) : -1;
    const nextOrderIndex = maxOrderIndex + 1;

    setFormData({
      title: '',
      description: '',
      orderIndex: nextOrderIndex,
      isLocked: false,
    });
    setUploadedFile(null);
    setEditingDocument(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (document: TrainingDocument) => {
    setEditingDocument(document);
    setFormData({
      title: document.title,
      description: document.description || '',
      orderIndex: document.orderIndex,
      isLocked: document.isLocked,
    });
    setUploadedFile({
      url: document.fileUrl,
      fileName: document.fileName,
      fileSize: document.fileSize || 0,
      fileType: document.fileType || '',
    });
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingDocument(null);
    setUploadedFile(null);

    // Calculate next orderIndex: max existing orderIndex + 1, or 0 if no documents
    const maxOrderIndex =
      documents.length > 0 ? Math.max(...documents.map((d) => d.orderIndex ?? 0)) : -1;
    const nextOrderIndex = maxOrderIndex + 1;

    setFormData({
      title: '',
      description: '',
      orderIndex: nextOrderIndex,
      isLocked: false,
    });
  };

  const handleFileUploadComplete = (
    fileUrl: string,
    fileName: string,
    fileSize: number,
    fileType: string
  ) => {
    setUploadedFile({ url: fileUrl, fileName, fileSize, fileType });
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }
    const kb = bytes / 1024;
    return `${kb.toFixed(2)} KB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For new documents, file upload is required
    if (!editingDocument && !uploadedFile) {
      toast.error('Lütfen bir dosya yükleyin');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingDocument
        ? `/api/trainings/${trainingId}/documents/${editingDocument.id}`
        : `/api/trainings/${trainingId}/documents`;

      const method = editingDocument ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          fileUrl: uploadedFile?.url || editingDocument?.fileUrl,
          fileName: uploadedFile?.fileName || editingDocument?.fileName,
          fileSize: uploadedFile?.fileSize || editingDocument?.fileSize,
          fileType: uploadedFile?.fileType || editingDocument?.fileType,
          orderIndex: formData.orderIndex,
          isLocked: formData.isLocked,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Döküman kaydedilemedi');
      }

      toast.success(
        editingDocument ? 'Döküman başarıyla güncellendi' : 'Döküman başarıyla eklendi'
      );
      handleCloseModal();
      onRefresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Döküman kaydedilirken bir hata oluştu';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Bu dökümanı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/trainings/${trainingId}/documents/${documentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Döküman silinemedi');
      }

      toast.success('Döküman başarıyla silindi');
      onRefresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Döküman silinirken bir hata oluştu';
      toast.error(errorMessage);
    }
  };

  const sortedDocuments = [...documents].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Dökümanlar</h3>
          <p className="text-sm text-muted-foreground">
            {documents.length} döküman {documents.length === 1 ? 'eklenmiş' : 'eklenmiş'}
          </p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddModal} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Döküman Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDocument ? 'Dökümanı Düzenle' : 'Yeni Döküman Ekle'}
              </DialogTitle>
              <DialogDescription>
                PDF, Word, Excel, PowerPoint veya görsel dosyası yükleyin.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingDocument && (
                <div className="space-y-2">
                  <Label>Dosya Yükle *</Label>
                  <FileUpload
                    onUploadComplete={handleFileUploadComplete}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                    maxSize={50 * 1024 * 1024}
                  />
                </div>
              )}
              {uploadedFile && (
                <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{uploadedFile.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadedFile.fileSize)}
                    </p>
                  </div>
                  {editingDocument && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                    >
                      Değiştir
                    </Button>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Döküman başlığı"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Döküman açıklaması (opsiyonel)"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderIndex">Sıra</Label>
                <Input
                  id="orderIndex"
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) =>
                    setFormData({ ...formData, orderIndex: parseInt(e.target.value, 10) || 0 })
                  }
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  Döküman sırası (0 = ilk döküman, daha yüksek sayı = daha sonra)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isLocked"
                  checked={formData.isLocked}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isLocked: checked === true })
                  }
                />
                <Label htmlFor="isLocked" className="text-sm font-normal cursor-pointer">
                  Kilitli (Önceki döküman okunmadan bu döküman açılmaz)
                </Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || (!editingDocument && !uploadedFile)}
                >
                  {isSubmitting ? 'Kaydediliyor...' : editingDocument ? 'Güncelle' : 'Ekle'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents List */}
      {sortedDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Döküman Bulunamadı</h3>
            <p className="text-muted-foreground mb-4">Bu eğitime henüz döküman eklenmemiş.</p>
            <Button onClick={handleOpenAddModal} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              İlk Dökümanı Ekle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedDocuments.map((document) => (
            <Card key={document.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-semibold">{document.title}</h4>
                      {document.isLocked && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="mr-1 h-3 w-3" />
                          Kilitli
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        Sıra: {document.orderIndex}
                      </Badge>
                    </div>
                    {document.description && (
                      <p className="text-sm text-muted-foreground">{document.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{document.fileName}</span>
                      {document.fileSize && <span>• {formatFileSize(document.fileSize)}</span>}
                      {document.fileType && <span>• {document.fileType}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(document)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(document.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
