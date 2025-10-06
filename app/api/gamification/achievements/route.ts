import { NextRequest, NextResponse } from 'next/server';
export async function GET(request: NextRequest) {
  try {
    // Mock achievement data - gerçek veritabanı entegrasyonu için daha sonra güncellenecek
    const achievements = [
      {
        id: '1',
        name: 'Video İzleyici',
        description: '10 video izleyin',
        icon: 'ri-video-line',
        color: 'bg-blue-500',
        completed: true,
        completed_at: '2024-01-20',
        progress: 10,
        target: 10,
      },
      {
        id: '2',
        name: 'Doküman Okuyucu',
        description: '5 doküman okuyun',
        icon: 'ri-file-text-line',
        color: 'bg-green-500',
        completed: true,
        completed_at: '2024-02-15',
        progress: 5,
        target: 5,
      },
      {
        id: '3',
        name: 'Quiz Çözücü',
        description: '15 quiz çözün',
        icon: 'ri-question-line',
        color: 'bg-purple-500',
        completed: false,
        progress: 8,
        target: 15,
      },
      {
        id: '4',
        name: 'Sürekli Öğrenci',
        description: '7 gün üst üste giriş yapın',
        icon: 'ri-calendar-check-line',
        color: 'bg-orange-500',
        completed: false,
        progress: 3,
        target: 7,
      },
      {
        id: '5',
        name: 'Topluluk Üyesi',
        description: "Forum'da 5 mesaj yazın",
        icon: 'ri-chat-3-line',
        color: 'bg-indigo-500',
        completed: false,
        progress: 2,
        target: 5,
      },
    ];
    return NextResponse.json({
      success: true,
      achievements: achievements,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Başarımlar getirilemedi' },
      { status: 500 }
    );
  }
}
