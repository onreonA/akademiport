'use client';

import { ForumCategory } from '@/3-domain/entities/Forum';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { MessageCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/presentation/components/ui/atoms/skeleton';

interface CategoryListProps {
  categories: ForumCategory[];
  programId?: string;
  basePath?: string;
  isLoading?: boolean;
}

export function CategoryList({
  categories,
  programId,
  basePath = '/forum',
  isLoading = false,
}: CategoryListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Henüz kategori oluşturulmamış.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <Link key={category.id} href={`${basePath}?categoryId=${category.id}`} className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {category.icon && <span className="text-2xl">{category.icon}</span>}
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
                {category.color && (
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {category.topicCount} konu
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {category.replyCount} yanıt
                </span>
              </div>
              {category.requireApproval && (
                <Badge variant="outline" className="mt-2">
                  Onay Gerekli
                </Badge>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
