const fs = require('fs');

// Admin proje yönetimi sayfasındaki handleDeleteProject fonksiyonunu düzelt
const filePath = 'app/admin/proje-yonetimi/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Eski fonksiyonu bul ve değiştir
const oldFunction = `  const handleDeleteProject = async (projectId: string) => {
    if (
      !confirm(
        'Bu projeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
      )
    ) {
      return;
    }
    try {
      const response = await fetch(\`/api/projects?id=\${projectId}\`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        // Projeyi listeden kaldır
        setProjects(prev => prev.filter(project => project.id !== projectId));
        alert('Proje başarıyla silindi!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Proje silinirken hata oluştu');
      }
    } catch (error) {
      alert('Proje silinirken hata oluştu');
    }
  };`;

const newFunction = `  const handleDeleteProject = async (project: Project) => {
    if (
      !confirm(
        'Bu projeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
      )
    ) {
      return;
    }
    try {
      const response = await fetch(\`/api/projects/\${project.id}\`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        // Projeyi listeden kaldır
        setProjects(prev => prev.filter(p => p.id !== project.id));
        alert('Proje başarıyla silindi!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Proje silinirken hata oluştu');
      }
    } catch (error) {
      alert('Proje silinirken hata oluştu');
    }
  };`;

// Fonksiyonu değiştir
content = content.replace(oldFunction, newFunction);

// Dosyayı kaydet
fs.writeFileSync(filePath, content);
console.log('✅ handleDeleteProject fonksiyonu başarıyla düzeltildi!');
console.log('📝 Değişiklikler:');
console.log('   - Parametre: projectId: string → project: Project');
console.log(
  '   - URL: /api/projects?id=${projectId} → /api/projects/${project.id}'
);
console.log('   - Filter: project.id !== projectId → p.id !== project.id');
