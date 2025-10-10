import { NextRequest, NextResponse } from 'next/server';

import { cacheKeys, cacheUtils } from '@/lib/cache/redis-cache';
import { requireAdmin, createAuthErrorResponse } from '@/lib/jwt-utils';
// GET /api/admin/dashboard-stats - Get real dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // JWT Authentication - Admin users only
    const user = await requireAdmin(request);
    // OPTIMIZED: Check cache first
    const cacheKey = cacheKeys.adminStats();
    const cachedData = cacheUtils.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    // TEMPORARY: Use mock data for performance testing
    // Mock data
    const companies = [
      { id: '1', status: 'active', created_at: new Date().toISOString() },
      { id: '2', status: 'active', created_at: new Date().toISOString() },
      { id: '3', status: 'inactive', created_at: new Date().toISOString() },
    ];
    const projects = [
      { id: '1', status: 'active' },
      { id: '2', status: 'completed' },
      { id: '3', status: 'active' },
    ];
    const consultants = [{ id: '1' }, { id: '2' }];
    const tasks = [
      { id: '1', status: 'active' },
      { id: '2', status: 'completed' },
    ];
    const educationAssignments = [
      { id: '1', status: 'completed' },
      { id: '2', status: 'active' },
    ];
    // Company stats
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => c.status === 'active').length;
    // Project stats
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(
      p => p.status === 'completed'
    ).length;
    // Consultant stats
    const totalConsultants = consultants.length;
    // Task stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    // Education stats
    const totalEducationAssignments = educationAssignments.length;
    const completedEducationAssignments = educationAssignments.filter(
      e => e.status === 'completed'
    ).length;
    // Calculate growth rate (companies added in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCompanies = companies.filter(
      c => new Date(c.created_at) > thirtyDaysAgo
    ).length;
    // Calculate derived metrics
    const growthRate =
      totalCompanies > 0
        ? Math.round((recentCompanies / totalCompanies) * 100 * 10) / 10
        : 0;
    const monthlyRevenue = activeCompanies * 800; // 800 TL per active company
    const stats = {
      totalProjects,
      activeProjects,
      completedProjects,
      totalCompanies,
      activeCompanies,
      totalConsultants,
      totalTasks,
      completedTasks,
      monthlyRevenue,
      growthRate,
      totalEducationAssignments,
      completedEducationAssignments,
    };
    const response = {
      success: true,
      data: stats,
    };
    // Cache the response
    cacheUtils.set(cacheKey, response, 5 * 60 * 1000); // 5 minutes cache
    return NextResponse.json(response);
  } catch (error: any) {
    // Handle authentication errors specifically
    if (error.message === 'Authentication required' || 
        error.message === 'Admin access required') {
      return createAuthErrorResponse(error.message, 401);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
