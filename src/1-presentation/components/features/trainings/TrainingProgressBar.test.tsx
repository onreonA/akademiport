/**
 * Unit Tests for TrainingProgressBar Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@/shared/test/utils';
import { TrainingProgressBar } from './TrainingProgressBar';

describe('TrainingProgressBar', () => {
  it('renders progress bar with percentage', () => {
    render(<TrainingProgressBar progress={50} />);

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('displays 0% when progress is 0', () => {
    render(<TrainingProgressBar progress={0} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('displays 100% when progress is 100', () => {
    render(<TrainingProgressBar progress={100} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('clamps progress values above 100', () => {
    render(<TrainingProgressBar progress={150} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('clamps progress values below 0', () => {
    render(<TrainingProgressBar progress={-10} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('displays label when provided', () => {
    render(<TrainingProgressBar progress={50} label="İlerleme" />);

    expect(screen.getByText('İlerleme')).toBeInTheDocument();
  });

  it('hides percentage when showPercentage is false', () => {
    render(<TrainingProgressBar progress={50} showPercentage={false} />);

    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('handles different sizes', () => {
    const { rerender } = render(<TrainingProgressBar progress={50} size="sm" />);
    expect(screen.getByText('50%')).toBeInTheDocument();

    rerender(<TrainingProgressBar progress={50} size="lg" />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('rounds progress percentage correctly', () => {
    render(<TrainingProgressBar progress={33.7} />);

    expect(screen.getByText('34%')).toBeInTheDocument();
  });
});
