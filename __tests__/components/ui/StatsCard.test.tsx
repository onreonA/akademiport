import { render, screen } from '@testing-library/react';

import StatsCard from '@/components/ui/StatsCard';

describe('StatsCard Component', () => {
  it('renders with basic props', () => {
    render(<StatsCard title='Total Users' value='1,234' icon='ri-user-line' />);

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders with label prop (backward compatibility)', () => {
    render(<StatsCard label='Total Users' value='1,234' />);

    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <StatsCard title='Default' value='100' variant='default' />
    );
    expect(screen.getByText('Default')).toBeInTheDocument();

    rerender(<StatsCard title='Gradient' value='200' variant='gradient' />);
    expect(screen.getByText('Gradient')).toBeInTheDocument();

    rerender(<StatsCard title='Primary' value='300' variant='primary' />);
    expect(screen.getByText('Primary')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(
      <StatsCard title='Small' value='100' size='sm' />
    );
    expect(screen.getByText('Small')).toBeInTheDocument();

    rerender(<StatsCard title='Large' value='200' size='lg' />);
    expect(screen.getByText('Large')).toBeInTheDocument();
  });

  it('renders with trend information', () => {
    render(
      <StatsCard
        title='Growth'
        value='12.5%'
        trend={{ value: 8, isPositive: true }}
      />
    );

    expect(screen.getByText('12.5%')).toBeInTheDocument();
    expect(screen.getByText('son 30 gün')).toBeInTheDocument();
  });

  it('renders with icon (string)', () => {
    render(<StatsCard title='Users' value='1,234' icon='ri-user-line' />);

    const iconElement = screen
      .getByText('Users')
      .closest('div')
      ?.querySelector('i');
    expect(iconElement).toHaveClass('ri-user-line');
  });

  it('shows loading state', () => {
    render(<StatsCard title='Loading' value='0' loading={true} />);

    // Loading state shows skeleton, not text
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();

    render(<StatsCard title='Clickable' value='100' onClick={handleClick} />);

    const card = screen.getByText('Clickable').closest('div');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('applies custom className', () => {
    render(<StatsCard title='Custom' value='100' className='custom-class' />);

    const card = screen.getByText('Custom').closest('div');
    expect(card).toHaveClass('custom-class');
  });
});
