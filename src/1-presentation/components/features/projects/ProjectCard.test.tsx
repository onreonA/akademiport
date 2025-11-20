/**
 * Unit Tests for ProjectCard Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { ProjectCard } from './ProjectCard';
import type { Project } from './ProjectCard';
import userEvent from '@testing-library/user-event';

describe('ProjectCard', () => {
  const createMockProject = (overrides?: Partial<Project>): Project => {
    return {
      id: 'project-1',
      name: 'Test Project',
      description: 'Test description',
      status: 'active',
      priority: 'medium',
      progress: 50,
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  };

  it('renders project card with basic information', () => {
    const project = createMockProject();
    render(<ProjectCard project={project} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('displays progress percentage', () => {
    const project = createMockProject({ progress: 75 });
    render(<ProjectCard project={project} />);

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('displays status badge', () => {
    const project = createMockProject({ status: 'active' });
    render(<ProjectCard project={project} />);

    expect(screen.getByText('Aktif')).toBeInTheDocument();
  });

  it('displays priority badge', () => {
    const project = createMockProject({ priority: 'high' });
    render(<ProjectCard project={project} />);

    expect(screen.getByText('Yüksek')).toBeInTheDocument();
  });

  it('displays company name when provided', () => {
    const project = createMockProject({ companyName: 'Test Company' });
    render(<ProjectCard project={project} />);

    const companyNames = screen.getAllByText('Test Company');
    expect(companyNames.length).toBeGreaterThan(0);
  });

  it('displays consultant name when provided', () => {
    const project = createMockProject({ consultantName: 'Test Consultant' });
    render(<ProjectCard project={project} />);

    const consultantTexts = screen.getAllByText('Test Consultant');
    expect(consultantTexts.length).toBeGreaterThan(0);
  });

  it('renders detail link button', () => {
    const project = createMockProject();
    render(<ProjectCard project={project} />);

    const detailLink = screen.getByRole('link', { name: /detaylar/i });
    expect(detailLink).toBeInTheDocument();
    expect(detailLink).toHaveAttribute('href', `/dashboard/projects/${project.id}`);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const project = createMockProject();
    const handleDelete = vi.fn();

    render(<ProjectCard project={project} onDelete={handleDelete} />);

    const deleteButton = screen.getByRole('button', { name: /sil/i });
    await user.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledWith(project);
  });

  it('always shows detail link button', () => {
    const project = createMockProject();
    render(<ProjectCard project={project} />);

    const detailLink = screen.getByRole('link', { name: /detaylar/i });
    expect(detailLink).toBeInTheDocument();
  });

  it('does not show delete button when onDelete is not provided', () => {
    const project = createMockProject();
    render(<ProjectCard project={project} />);

    expect(screen.queryByRole('button', { name: /sil/i })).not.toBeInTheDocument();
  });

  it('displays creation date', () => {
    const project = createMockProject({ createdAt: '2025-01-15T00:00:00Z' });
    render(<ProjectCard project={project} />);

    expect(screen.getByText(/oluşturulma/i)).toBeInTheDocument();
  });

  it('handles missing description gracefully', () => {
    const project = createMockProject({ description: undefined });
    render(<ProjectCard project={project} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('displays different status labels correctly', () => {
    const { rerender } = render(
      <ProjectCard project={createMockProject({ status: 'planning' })} />
    );
    expect(screen.getByText('Planlama')).toBeInTheDocument();

    rerender(<ProjectCard project={createMockProject({ status: 'completed' })} />);
    expect(screen.getByText('Tamamlandı')).toBeInTheDocument();
  });

  it('displays different priority labels correctly', () => {
    const { rerender } = render(<ProjectCard project={createMockProject({ priority: 'low' })} />);
    expect(screen.getByText('Düşük')).toBeInTheDocument();

    rerender(<ProjectCard project={createMockProject({ priority: 'critical' })} />);
    expect(screen.getByText('Kritik')).toBeInTheDocument();
  });
});
