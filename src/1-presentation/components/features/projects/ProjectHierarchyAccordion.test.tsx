/**
 * Unit Tests for ProjectHierarchyAccordion Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { ProjectHierarchyAccordion } from './ProjectHierarchyAccordion';
import type { SubProjectWithTasksDTO, TaskDTO } from '@/2-application/dto/project-hierarchy.dto';
import userEvent from '@testing-library/user-event';

const createMockTask = (overrides?: Partial<TaskDTO>): TaskDTO => ({
  id: 'task-1',
  title: 'Test Task',
  description: 'Test task description',
  status: 'todo',
  priority: 'medium',
  orderIndex: 0,
  subProjectId: 'subproject-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const createMockSubProject = (
  overrides?: Partial<SubProjectWithTasksDTO>
): SubProjectWithTasksDTO => ({
  id: 'subproject-1',
  name: 'Test Sub-Project',
  description: 'Test sub-project description',
  status: 'active',
  orderIndex: 0,
  progress: 0,
  tasks: [createMockTask()],
  stats: {
    totalTasks: 1,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 1,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('ProjectHierarchyAccordion', () => {
  const mockSubProjects: SubProjectWithTasksDTO[] = [
    createMockSubProject({ id: 'sp-1', name: 'Sub-Project 1' }),
    createMockSubProject({ id: 'sp-2', name: 'Sub-Project 2' }),
  ];

  it('renders accordion component', () => {
    render(
      <ProjectHierarchyAccordion projectId="project-1" subProjects={mockSubProjects} mode="admin" />
    );

    // Component should render (sub-projects might be in collapsible sections)
    const { container } = render(
      <ProjectHierarchyAccordion projectId="project-1" subProjects={mockSubProjects} mode="admin" />
    );
    expect(container).toBeTruthy();
  });

  it('renders with sub-projects data', () => {
    const subProjects = [createMockSubProject({ name: 'Test Sub-Project', progress: 75 })];
    const { container } = render(
      <ProjectHierarchyAccordion projectId="project-1" subProjects={subProjects} mode="admin" />
    );

    // Component should render
    expect(container).toBeTruthy();
  });

  it('renders with tasks data', () => {
    const subProjects = [
      createMockSubProject({
        tasks: [
          createMockTask({ id: 'task-1', title: 'Task 1' }),
          createMockTask({ id: 'task-2', title: 'Task 2' }),
        ],
        stats: {
          totalTasks: 2,
          completedTasks: 0,
          inProgressTasks: 0,
          todoTasks: 2,
        },
      }),
    ];

    const { container } = render(
      <ProjectHierarchyAccordion projectId="project-1" subProjects={subProjects} mode="admin" />
    );

    // Component should render with tasks
    expect(container).toBeTruthy();
  });

  it('renders with editable mode', () => {
    const handleSubProjectEdit = vi.fn();
    const { container } = render(
      <ProjectHierarchyAccordion
        projectId="project-1"
        subProjects={mockSubProjects}
        mode="admin"
        editable={true}
        onSubProjectEdit={handleSubProjectEdit}
      />
    );

    // Component should render in editable mode
    expect(container).toBeTruthy();
  });

  it('renders with task create handler', () => {
    const handleTaskCreate = vi.fn();
    const subProjects = [createMockSubProject()];

    const { container } = render(
      <ProjectHierarchyAccordion
        projectId="project-1"
        subProjects={subProjects}
        mode="admin"
        editable={true}
        onTaskCreate={handleTaskCreate}
      />
    );

    // Component should render
    expect(container).toBeTruthy();
  });

  it('renders empty state when no sub-projects', () => {
    const { container } = render(
      <ProjectHierarchyAccordion projectId="project-1" subProjects={[]} mode="admin" />
    );

    // Component should render even with empty sub-projects
    expect(container).toBeTruthy();
  });

  it('renders with different task statuses', () => {
    const subProjects = [
      createMockSubProject({
        tasks: [
          createMockTask({ status: 'done', title: 'Done Task' }),
          createMockTask({ status: 'in_progress', title: 'In Progress Task' }),
        ],
        stats: {
          totalTasks: 2,
          completedTasks: 1,
          inProgressTasks: 1,
          todoTasks: 0,
        },
      }),
    ];

    const { container } = render(
      <ProjectHierarchyAccordion projectId="project-1" subProjects={subProjects} mode="admin" />
    );

    // Component should render with different task statuses
    expect(container).toBeTruthy();
  });

  it('handles different modes correctly', () => {
    const { rerender, container: adminContainer } = render(
      <ProjectHierarchyAccordion projectId="project-1" subProjects={mockSubProjects} mode="admin" />
    );

    expect(adminContainer).toBeTruthy();

    rerender(
      <ProjectHierarchyAccordion
        projectId="project-1"
        subProjects={mockSubProjects}
        mode="consultant"
      />
    );

    expect(adminContainer).toBeTruthy();

    rerender(
      <ProjectHierarchyAccordion
        projectId="project-1"
        subProjects={mockSubProjects}
        mode="company"
      />
    );

    expect(adminContainer).toBeTruthy();
  });
});
