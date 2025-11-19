/**
 * Page Checker Script - Dry Run
 *
 * Bu script sadece navigation linklerini çıkarır ve listeler,
 * gerçek sayfa kontrolü yapmaz. Test için kullanılabilir.
 */

import * as fs from 'fs';
import * as path from 'path';

// Import navigation configs
import {
  MASTER_ADMIN_NAVIGATION,
  CONSULTANT_NAVIGATION,
  COMPANY_ADMIN_NAVIGATION,
  COMPANY_USER_NAVIGATION,
  type NavigationConfig,
} from '../src/5-shared/constants/navigation';

// =====================================================
// HELPER FUNCTIONS
// =====================================================
function extractAllLinks(
  config: NavigationConfig,
  role: string
): Array<{ url: string; label: string; role: string }> {
  const links: Array<{ url: string; label: string; role: string }> = [];

  // Main navigation items
  config.main.forEach((item) => {
    links.push({ url: item.href, label: item.label, role });

    // Children items
    if (item.children) {
      item.children.forEach((child) => {
        links.push({ url: child.href, label: `${item.label} > ${child.label}`, role });
      });
    }
  });

  // Bottom navigation items
  config.bottom.forEach((item) => {
    links.push({ url: item.href, label: item.label, role });
  });

  return links;
}

// =====================================================
// MAIN FUNCTION
// =====================================================
function main() {
  console.log('🔍 Navigation Linklerini Çıkarıyor...\n');

  // Extract all links from navigation
  const allLinks = [
    ...extractAllLinks(MASTER_ADMIN_NAVIGATION, 'Master Admin'),
    ...extractAllLinks(CONSULTANT_NAVIGATION, 'Consultant'),
    ...extractAllLinks(COMPANY_ADMIN_NAVIGATION, 'Company Admin'),
    ...extractAllLinks(COMPANY_USER_NAVIGATION, 'Company User'),
  ];

  // Remove duplicates
  const uniqueLinks = Array.from(new Map(allLinks.map((link) => [link.url, link])).values());

  console.log(`📊 Toplam ${uniqueLinks.length} benzersiz link bulundu\n`);

  // Group by role
  const linksByRole = new Map<string, Array<{ url: string; label: string }>>();
  uniqueLinks.forEach((link) => {
    if (!linksByRole.has(link.role)) {
      linksByRole.set(link.role, []);
    }
    linksByRole.get(link.role)!.push({ url: link.url, label: link.label });
  });

  // Print by role
  linksByRole.forEach((links, role) => {
    console.log(`\n📋 ${role} (${links.length} link):`);
    links.forEach((link) => {
      const isNew = link.label.toLowerCase().includes('yeni');
      const icon = isNew ? '✨' : '  ';
      console.log(`  ${icon} ${link.url.padEnd(50)} - ${link.label}`);
    });
  });

  // Find "Yeni" pages
  const newPages = uniqueLinks.filter((link) => link.label.toLowerCase().includes('yeni'));

  console.log(`\n\n✨ "Yeni" Sayfalar (${newPages.length}):`);
  newPages.forEach((page) => {
    console.log(`  - [${page.role}] ${page.label}: ${page.url}`);
  });

  // Summary
  console.log(`\n\n📊 Özet:`);
  console.log(`  Toplam Link: ${uniqueLinks.length}`);
  console.log(`  Master Admin: ${linksByRole.get('Master Admin')?.length || 0}`);
  console.log(`  Consultant: ${linksByRole.get('Consultant')?.length || 0}`);
  console.log(`  Company Admin: ${linksByRole.get('Company Admin')?.length || 0}`);
  console.log(`  Company User: ${linksByRole.get('Company User')?.length || 0}`);
  console.log(`  "Yeni" Sayfalar: ${newPages.length}`);

  console.log(`\n✅ Dry run tamamlandı!`);
  console.log(`\n💡 Gerçek kontrol için:`);
  console.log(`   1. npm run dev (bir terminalde)`);
  console.log(`   2. npm run check:pages (başka terminalde)`);
}

main();
