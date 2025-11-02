'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  HelpCircle,
  ArrowRight,
  Clock,
  Building2,
  FileText,
  MessageSquare,
  CheckCircle2,
  Reply,
} from 'lucide-react';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/presentation/components/ui/atoms/tabs';

interface Reply {
  id: string;
  comment: string;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface Question {
  id: string;
  comment: string;
  isQuestion: boolean;
  hasReply: boolean;
  replies?: Reply[];
  createdAt: string;
  task?: {
    id: string;
    title: string;
    status: string;
    subProject?: {
      id: string;
      name: string;
      project?: {
        id: string;
        name: string;
        company?: {
          id: string;
          name: string;
        };
      };
    };
  };
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
}

const statusConfig = {
  todo: { label: 'Yapılacak', color: 'bg-gray-500' },
  in_progress: { label: 'Devam Ediyor', color: 'bg-blue-500' },
  review: { label: 'İncelemede', color: 'bg-yellow-500' },
  done: { label: 'Tamamlandı', color: 'bg-green-500' },
  cancelled: { label: 'İptal', color: 'bg-red-500' },
};

export default function ConsultantPendingQuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/consultant/tasks/questions/pending');
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch questions:', errorData);
        throw new Error(errorData.error || 'Failed to fetch questions');
      }

      const data = await response.json();
      console.log('Questions API response:', data);
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Sorular yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-32 bg-muted animate-pulse rounded-2xl" />
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <EnhancedCard variant="neon" className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Hata Oluştu</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchQuestions}>Tekrar Dene</Button>
          </EnhancedCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <GradientHeader
          title="Tüm Sorular"
          subtitle="Firmalardan gelen sorular ve cevaplarınız"
          icon={HelpCircle}
        />

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Cevap Bekleyen ({questions.filter((q) => !q.hasReply).length})
            </TabsTrigger>
            <TabsTrigger value="answered" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Cevaplanan ({questions.filter((q) => q.hasReply).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {questions.filter((q) => !q.hasReply).length === 0 ? (
              <EnhancedCard variant="glass" className="p-8 md:p-12 text-center">
                <HelpCircle className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl md:text-2xl font-bold mb-2">Cevap Bekleyen Soru Yok</h3>
                <p className="text-muted-foreground">
                  Şu anda atanmış projelerinizde cevap bekleyen soru bulunmamaktadır.
                </p>
              </EnhancedCard>
            ) : (
              <div className="space-y-4">
                {questions
                  .filter((q) => !q.hasReply)
                  .map((question) => (
                    <QuestionCard key={question.id} question={question} router={router} />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="answered" className="mt-6">
            {questions.filter((q) => q.hasReply).length === 0 ? (
              <EnhancedCard variant="glass" className="p-8 md:p-12 text-center">
                <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl md:text-2xl font-bold mb-2">Cevaplanmış Soru Yok</h3>
                <p className="text-muted-foreground">Henüz cevaplanmış soru bulunmamaktadır.</p>
              </EnhancedCard>
            ) : (
              <div className="space-y-4">
                {questions
                  .filter((q) => q.hasReply)
                  .map((question) => (
                    <QuestionCard key={question.id} question={question} router={router} />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Question Card Component
function QuestionCard({
  question,
  router,
}: {
  question: Question;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <EnhancedCard
      variant="glass"
      hover
      glow
      className={`p-6 border-l-4 ${
        question.hasReply ? 'border-green-500 bg-green-50/10' : 'border-blue-500'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          {/* Question Content */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <HelpCircle className="w-3 h-3 mr-1" />
                Soru
              </Badge>
              {question.hasReply && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Cevaplandı
                </Badge>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(question.createdAt).toLocaleString('tr-TR')}
              </span>
              {question.user && (
                <span className="text-xs text-muted-foreground">
                  {question.user.fullName || question.user.email}
                </span>
              )}
            </div>
            <p className="text-sm whitespace-pre-wrap text-foreground">{question.comment}</p>
          </div>

          {/* Replies */}
          {question.hasReply && question.replies && question.replies.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Reply className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Cevaplar ({question.replies.length})
                </span>
              </div>
              {question.replies.map((reply) => (
                <div
                  key={reply.id}
                  className="ml-4 p-3 bg-green-50/50 rounded-lg border-l-4 border-green-400"
                >
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-medium text-foreground">
                      {reply.user?.fullName || reply.user?.email || 'Kullanıcı'}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(reply.createdAt).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <p className="text-xs whitespace-pre-wrap text-foreground">{reply.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Task & Project Info */}
          {question.task && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-border">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Görev:</span>
                </div>
                <p className="font-medium text-sm">{question.task.title}</p>
                <Badge
                  className={
                    statusConfig[question.task.status as keyof typeof statusConfig]?.color ||
                    'bg-gray-400'
                  }
                >
                  {statusConfig[question.task.status as keyof typeof statusConfig]?.label ||
                    question.task.status}
                </Badge>
              </div>

              {question.task.subProject && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Proje:</span>
                  </div>
                  <p className="font-medium text-sm">
                    {question.task.subProject.project?.name || 'Proje bilgisi yok'}
                  </p>
                  {question.task.subProject.project?.company && (
                    <p className="text-xs text-muted-foreground">
                      {question.task.subProject.project.company.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => {
                // Görev detay sayfasına yönlendir
                if (question.task?.id) {
                  router.push(`/consultant-dashboard/tasks/${question.task.id}/edit`);
                }
              }}
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {question.hasReply ? 'Göreve Git ve Detayları Gör' : 'Göreve Git ve Cevapla'}
            </Button>
          </div>
        </div>
      </div>
    </EnhancedCard>
  );
}
