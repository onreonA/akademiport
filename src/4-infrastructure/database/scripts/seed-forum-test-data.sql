-- Forum Test Data Seed Script
-- Bu script test için forum konusu ve yorumları oluşturur

-- Test kullanıcısı bul (company user)
DO $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
  v_program_id UUID;
  v_category_id UUID;
  v_topic_id UUID;
BEGIN
  -- Bir company user bul
  SELECT u.id, u.company_id INTO v_user_id, v_company_id
  FROM users u
  WHERE u.role = 'company_user' OR u.role = 'company_admin'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Company user bulunamadı. Önce bir company user oluşturun.';
  END IF;

  -- Program ID'yi al
  SELECT program_id INTO v_program_id
  FROM companies
  WHERE id = v_company_id;

  IF v_program_id IS NULL THEN
    RAISE EXCEPTION 'Company için program bulunamadı.';
  END IF;

  -- Kategori ID'yi al veya oluştur
  SELECT id INTO v_category_id
  FROM forum_categories
  WHERE program_id = v_program_id AND slug = 'genel-sorular'
  LIMIT 1;

  -- Eğer kategori yoksa oluştur
  IF v_category_id IS NULL THEN
    INSERT INTO forum_categories (
      id,
      program_id,
      name,
      slug,
      description,
      icon,
      color,
      order_index,
      require_approval,
      topic_count,
      reply_count,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_program_id,
      'Genel Sorular',
      'genel-sorular',
      'Genel sorular ve tartışmalar için kategori',
      '💬',
      '#3B82F6',
      0,
      false,
      0,
      0,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_category_id;
  END IF;

  -- Test forum konusu oluştur
  INSERT INTO forum_topics (
    id,
    program_id,
    category_id,
    author_id,
    company_id,
    title,
    slug,
    content,
    status,
    priority,
    is_pinned,
    is_locked,
    is_approved,
    view_count,
    reply_count,
    like_count,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_program_id,
    v_category_id,
    v_user_id,
    v_company_id,
    'Test Forum Konusu - Proje Yönetimi Hakkında',
    'test-forum-konusu-proje-yonetimi-hakkinda',
    'Merhaba,

Bu bir test forum konusudur. Proje yönetimi süreçleri hakkında deneyimlerinizi paylaşmak istiyorum.

Proje yönetiminde en önemli faktörler nelerdir? Hangi araçları kullanıyorsunuz?

Görüşlerinizi bekliyorum.',
    'open',
    'normal',
    false,
    false,
    true,
    0,
    0,
    0,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_topic_id;

  -- Kategori topic_count'u güncelle
  UPDATE forum_categories
  SET topic_count = topic_count + 1
  WHERE id = v_category_id;

  -- Test yorumu oluştur
  INSERT INTO forum_replies (
    id,
    topic_id,
    author_id,
    company_id,
    parent_id,
    content,
    is_approved,
    is_solution,
    like_count,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_topic_id,
    v_user_id,
    v_company_id,
    NULL,
    'Harika bir soru! Proje yönetiminde bence en önemli faktörler:

1. **Açık İletişim**: Tüm ekip üyeleri arasında düzenli ve şeffaf iletişim
2. **Hedef Belirleme**: Net ve ölçülebilir hedefler koymak
3. **Risk Yönetimi**: Olası riskleri önceden tespit edip planlamak
4. **Esneklik**: Değişen koşullara hızlı adapte olabilmek

Araç olarak Jira ve Trello kullanıyorum. Siz hangi araçları tercih ediyorsunuz?',
    true,
    false,
    0,
    NOW(),
    NOW()
  );

  -- Topic reply_count'u güncelle
  UPDATE forum_topics
  SET reply_count = 1,
      last_reply_at = NOW(),
      last_reply_by = v_user_id
  WHERE id = v_topic_id;

  -- Kategori reply_count'u güncelle
  UPDATE forum_categories
  SET reply_count = reply_count + 1
  WHERE id = v_category_id;

  RAISE NOTICE 'Test forum konusu ve yorumu başarıyla oluşturuldu!';
  RAISE NOTICE 'Topic ID: %', v_topic_id;
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Program ID: %', v_program_id;
END $$;

