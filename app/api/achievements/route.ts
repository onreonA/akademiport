import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// Kullanıcının başarımlarını kontrol et ve yeni başarımlar ver
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const body = await request.json();
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    const { action_type, reference_id, reference_data } = body;
    if (!action_type) {
      return NextResponse.json(
        { success: false, error: 'Aksiyon türü gerekli' },
        { status: 400 }
      );
    }
    let newAchievements = [];
    // Aksiyon türüne göre başarımları kontrol et
    switch (action_type) {
      case 'event_participation':
        newAchievements = await checkParticipationAchievements(
          userEmail,
          reference_data
        );
        break;
      case 'material_download':
        newAchievements = await checkDownloadAchievements(
          userEmail,
          reference_data
        );
        break;
      case 'level_up':
        newAchievements = await checkLevelAchievements(
          userEmail,
          reference_data
        );
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Geçersiz aksiyon türü' },
          { status: 400 }
        );
    }
    return NextResponse.json({
      success: true,
      data: {
        newAchievements,
        totalNew: newAchievements.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
// Katılım başarımlarını kontrol et
async function checkParticipationAchievements(
  userEmail: string,
  eventData: any
) {
  const newAchievements: any[] = [];
  // Kullanıcının toplam katılım sayısını al
  const { data: participationCount, error: countError } = await supabase
    .from('event_participants')
    .select('id', { count: 'exact' })
    .eq('user_email', userEmail);
  if (countError) {
    return newAchievements;
  }
  const totalParticipations = participationCount?.length || 0;
  // Katılım başarımlarını kontrol et
  const { data: achievementTypes, error: typesError } = await supabase
    .from('achievement_types')
    .select('*')
    .eq('category', 'participation')
    .eq('is_active', true);
  if (typesError) {
    return newAchievements;
  }
  for (const achievementType of achievementTypes || []) {
    const requirements = achievementType.requirements;
    if (
      requirements?.events_count &&
      totalParticipations >= requirements.events_count
    ) {
      // Bu başarımı zaten kazanmış mı kontrol et
      const { data: existingAchievement } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_email', userEmail)
        .eq('achievement_type_id', achievementType.id)
        .single();
      if (!existingAchievement) {
        // Yeni başarım ver
        const { data: newAchievement, error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_email: userEmail,
            achievement_type_id: achievementType.id,
            points_earned: achievementType.points_reward,
            metadata: { event_id: eventData?.event_id },
          })
          .select(
            `
            *,
            achievement_types (
              name,
              description,
              icon,
              points_reward,
              category
            )
          `
          )
          .single();
        if (!insertError && newAchievement) {
          newAchievements.push(newAchievement);
          // Puan ekle
          await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '')}/api/points`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-User-Email': userEmail,
              },
              body: JSON.stringify({
                points: achievementType.points_reward,
                transaction_type: 'achievement',
                description: `${achievementType.name} başarımı kazandın!`,
                reference_id: newAchievement.id,
                reference_type: 'achievement',
              }),
            }
          );
        }
      }
    }
  }
  return newAchievements;
}
// İndirme başarımlarını kontrol et
async function checkDownloadAchievements(userEmail: string, downloadData: any) {
  const newAchievements: any[] = [];
  // Kullanıcının toplam indirme sayısını al
  const { data: downloadCount, error: countError } = await supabase
    .from('material_downloads')
    .select('id', { count: 'exact' })
    .eq('user_email', userEmail);
  if (countError) {
    return newAchievements;
  }
  const totalDownloads = downloadCount?.length || 0;
  // İndirme başarımlarını kontrol et
  const { data: achievementTypes, error: typesError } = await supabase
    .from('achievement_types')
    .select('*')
    .eq('category', 'download')
    .eq('is_active', true);
  if (typesError) {
    return newAchievements;
  }
  for (const achievementType of achievementTypes || []) {
    const requirements = achievementType.requirements;
    if (
      requirements?.downloads_count &&
      totalDownloads >= requirements.downloads_count
    ) {
      // Bu başarımı zaten kazanmış mı kontrol et
      const { data: existingAchievement } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_email', userEmail)
        .eq('achievement_type_id', achievementType.id)
        .single();
      if (!existingAchievement) {
        // Yeni başarım ver
        const { data: newAchievement, error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_email: userEmail,
            achievement_type_id: achievementType.id,
            points_earned: achievementType.points_reward,
            metadata: { material_id: downloadData?.material_id },
          })
          .select(
            `
            *,
            achievement_types (
              name,
              description,
              icon,
              points_reward,
              category
            )
          `
          )
          .single();
        if (!insertError && newAchievement) {
          newAchievements.push(newAchievement);
          // Puan ekle
          await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '')}/api/points`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-User-Email': userEmail,
              },
              body: JSON.stringify({
                points: achievementType.points_reward,
                transaction_type: 'achievement',
                description: `${achievementType.name} başarımı kazandın!`,
                reference_id: newAchievement.id,
                reference_type: 'achievement',
              }),
            }
          );
        }
      }
    }
  }
  return newAchievements;
}
// Seviye başarımlarını kontrol et
async function checkLevelAchievements(userEmail: string, levelData: any) {
  const newAchievements: any[] = [];
  const currentLevel = levelData?.current_level || 1;
  // Seviye başarımlarını kontrol et
  const { data: achievementTypes, error: typesError } = await supabase
    .from('achievement_types')
    .select('*')
    .eq('category', 'level')
    .eq('is_active', true);
  if (typesError) {
    return newAchievements;
  }
  for (const achievementType of achievementTypes || []) {
    const requirements = achievementType.requirements;
    if (requirements?.level && currentLevel >= requirements.level) {
      // Bu başarımı zaten kazanmış mı kontrol et
      const { data: existingAchievement } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_email', userEmail)
        .eq('achievement_type_id', achievementType.id)
        .single();
      if (!existingAchievement) {
        // Yeni başarım ver
        const { data: newAchievement, error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_email: userEmail,
            achievement_type_id: achievementType.id,
            points_earned: achievementType.points_reward,
            metadata: { level: currentLevel },
          })
          .select(
            `
            *,
            achievement_types (
              name,
              description,
              icon,
              points_reward,
              category
            )
          `
          )
          .single();
        if (!insertError && newAchievement) {
          newAchievements.push(newAchievement);
          // Puan ekle
          await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '')}/api/points`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-User-Email': userEmail,
              },
              body: JSON.stringify({
                points: achievementType.points_reward,
                transaction_type: 'achievement',
                description: `${achievementType.name} başarımı kazandın!`,
                reference_id: newAchievement.id,
                reference_type: 'achievement',
              }),
            }
          );
        }
      }
    }
  }
  return newAchievements;
}
