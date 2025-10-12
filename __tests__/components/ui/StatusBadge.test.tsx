import { render, screen } from '@testing-library/react';

import StatusBadge from '@/components/ui/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders with default props', () => {
    render(<StatusBadge status='active' />);

    expect(screen.getByText('Aktif')).toBeInTheDocument();
  });

  it('renders with different status types', () => {
    const { rerender } = render(<StatusBadge status='online' />);
    expect(screen.getByText('Çevrimiçi')).toBeInTheDocument();

    rerender(<StatusBadge status='offline' />);
    expect(screen.getByText('Çevrimdışı')).toBeInTheDocument();

    rerender(<StatusBadge status='pending' />);
    expect(screen.getByText('Beklemede')).toBeInTheDocument();

    rerender(<StatusBadge status='completed' />);
    expect(screen.getByText('Tamamlandı')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<StatusBadge status='active' size='sm' />);
    expect(screen.getByText('Aktif')).toBeInTheDocument();

    rerender(<StatusBadge status='active' size='lg' />);
    expect(screen.getByText('Aktif')).toBeInTheDocument();
  });

  it('renders dot only when showText is false', () => {
    render(<StatusBadge status='active' showText={false} />);

    // Should not show text
    expect(screen.queryByText('Aktif')).not.toBeInTheDocument();

    // Should show dot (find by class)
    const container = screen.getByRole('generic');
    const dot = container.querySelector('span span');
    expect(dot).toHaveClass('rounded-full');
  });

  it('renders text only when showDot is false', () => {
    render(<StatusBadge status='active' showDot={false} />);

    // Should show text
    expect(screen.getByText('Aktif')).toBeInTheDocument();

    // Should not show dot
    const container = screen.getByRole('generic');
    const dot = container.querySelector('span span');
    expect(dot).not.toHaveClass('rounded-full');
  });

  it('shows pulse animation when pulse is true', () => {
    render(<StatusBadge status='active' pulse={true} />);

    const container = screen.getByRole('generic');
    const pulseElement = container.querySelector('span span');
    expect(pulseElement).toHaveClass('animate-pulse');
  });

  it('applies custom className', () => {
    render(<StatusBadge status='active' className='custom-class' />);

    const badge = screen.getByText('Aktif').closest('span');
    expect(badge).toHaveClass('custom-class');
  });

  it('handles unknown status with fallback', () => {
    // @ts-ignore - Testing unknown status
    render(<StatusBadge status='unknown' />);

    // Should render without crashing and use fallback
    expect(screen.getByText('Beklemede')).toBeInTheDocument();
  });

  it('handles unknown size with fallback', () => {
    // @ts-ignore - Testing unknown size
    render(<StatusBadge status='active' size='unknown' />);

    // Should render without crashing and use fallback
    expect(screen.getByText('Aktif')).toBeInTheDocument();
  });
});
