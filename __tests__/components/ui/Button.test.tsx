import { render, screen, fireEvent } from '@testing-library/react';

import Button from '@/components/ui/Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with text content', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders with icon', () => {
      render(<Button icon='ri-check-line'>Save</Button>);
      const icon = screen.getByRole('button').querySelector('i.ri-check-line');
      expect(icon).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Button className='custom-class'>Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('renders primary variant correctly', () => {
      render(<Button variant='primary'>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('from-blue-500');
    });

    it('renders secondary variant correctly', () => {
      render(<Button variant='secondary'>Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white', 'border', 'border-gray-300');
    });

    it('renders success variant correctly', () => {
      render(<Button variant='success'>Success</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('from-green-500');
    });

    it('renders danger variant correctly', () => {
      render(<Button variant='danger'>Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('from-red-500');
    });

    it('renders ghost variant correctly', () => {
      render(<Button variant='ghost'>Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-gray-100');
    });
  });

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      render(<Button size='sm'>Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('renders medium size correctly', () => {
      render(<Button size='md'>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-base');
    });

    it('renders large size correctly', () => {
      render(<Button size='lg'>Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });
  });

  describe('States', () => {
    it('shows loading state', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'disabled:opacity-50',
        'disabled:cursor-not-allowed'
      );
    });
  });

  describe('Interactions', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(
        <Button onClick={handleClick} disabled>
          Click me
        </Button>
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(
        <Button onClick={handleClick} loading>
          Click me
        </Button>
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Full Width', () => {
    it('applies full width styles when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      expect(screen.getByRole('button')).toHaveClass('w-full');
    });

    it('does not apply full width styles by default', () => {
      render(<Button>Normal</Button>);
      expect(screen.getByRole('button')).not.toHaveClass('w-full');
    });
  });

  describe('Type Attribute', () => {
    it('can be set to button type', () => {
      render(<Button type='button'>Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('can be set to submit type', () => {
      render(<Button type='submit'>Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });
});
