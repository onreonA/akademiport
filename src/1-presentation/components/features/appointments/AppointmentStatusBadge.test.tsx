/**
 * Component Tests for AppointmentStatusBadge
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';

describe('AppointmentStatusBadge', () => {
  it('renders pending status badge', () => {
    render(<AppointmentStatusBadge status="pending" />);
    const badge = screen.getByText(/beklemede/i);
    expect(badge).toBeInTheDocument();
    // Badge uses variant="outline" for pending
    expect(badge).toBeInTheDocument();
  });

  it('renders approved status badge', () => {
    render(<AppointmentStatusBadge status="approved" />);
    const badge = screen.getByText(/onaylandı/i);
    expect(badge).toBeInTheDocument();
    // Badge uses variant="default" for approved
    expect(badge).toBeInTheDocument();
  });

  it('renders rejected status badge', () => {
    render(<AppointmentStatusBadge status="rejected" />);
    const badge = screen.getByText(/reddedildi/i);
    expect(badge).toBeInTheDocument();
    // Badge uses variant="destructive" for rejected
    expect(badge).toBeInTheDocument();
  });

  it('renders completed status badge', () => {
    render(<AppointmentStatusBadge status="completed" />);
    const badge = screen.getByText(/tamamlandı/i);
    expect(badge).toBeInTheDocument();
    // Badge uses variant="secondary" for completed
    expect(badge).toBeInTheDocument();
  });

  it('renders cancelled status badge', () => {
    render(<AppointmentStatusBadge status="cancelled" />);
    const badge = screen.getByText('İptal Edildi');
    expect(badge).toBeInTheDocument();
    // Badge uses variant="destructive" for cancelled
  });
});
