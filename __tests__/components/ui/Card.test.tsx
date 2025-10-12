import { render, screen } from '@testing-library/react';

import Card from '@/components/ui/Card';

describe('Card Component', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <p>Test content</p>
        </Card>
      );
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Card className='custom-class'>
          <p>Content</p>
        </Card>
      );
      const card = screen.getByText('Content').parentElement;
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('renders base variant with correct styles', () => {
      render(
        <Card variant='base'>
          <p>Base Card</p>
        </Card>
      );
      const card = screen.getByText('Base Card').parentElement;
      expect(card).toHaveClass('bg-white', 'border', 'border-gray-200');
    });

    it('renders elevated variant with correct styles', () => {
      render(
        <Card variant='elevated'>
          <p>Elevated Card</p>
        </Card>
      );
      const card = screen.getByText('Elevated Card').parentElement;
      expect(card).toHaveClass('bg-white', 'rounded-xl');
    });

    it('renders flat variant with correct styles', () => {
      render(
        <Card variant='flat'>
          <p>Flat Card</p>
        </Card>
      );
      const card = screen.getByText('Flat Card').parentElement;
      expect(card).toHaveClass('bg-gray-50');
    });

    it('renders glass variant with correct styles', () => {
      render(
        <Card variant='glass'>
          <p>Glass Card</p>
        </Card>
      );
      const card = screen.getByText('Glass Card').parentElement;
      expect(card).toHaveClass('backdrop-blur-sm');
    });
  });

  describe('Padding', () => {
    it('applies default padding', () => {
      render(
        <Card>
          <p>Content</p>
        </Card>
      );
      const card = screen.getByText('Content').parentElement;
      expect(card).toHaveClass('p-6');
    });

    it('applies small padding when padding is sm', () => {
      render(
        <Card padding='sm'>
          <p>Content</p>
        </Card>
      );
      const card = screen.getByText('Content').parentElement;
      expect(card).toHaveClass('p-4');
    });

    it('applies small padding', () => {
      render(
        <Card padding='sm'>
          <p>Content</p>
        </Card>
      );
      const card = screen.getByText('Content').parentElement;
      expect(card).toHaveClass('p-4');
    });

    it('applies large padding', () => {
      render(
        <Card padding='lg'>
          <p>Content</p>
        </Card>
      );
      const card = screen.getByText('Content').parentElement;
      expect(card).toHaveClass('p-8');
    });
  });

  describe('Hoverable', () => {
    it('applies hover styles when hover is true', () => {
      render(
        <Card hover>
          <p>Hoverable Card</p>
        </Card>
      );
      const card = screen.getByText('Hoverable Card').parentElement;
      expect(card).toHaveClass('hover:shadow-lg');
    });

    it('does not apply hover styles by default', () => {
      render(
        <Card>
          <p>Normal Card</p>
        </Card>
      );
      const card = screen.getByText('Normal Card').parentElement;
      expect(card).not.toHaveClass('hover:shadow-xl');
    });
  });

  describe('Border Radius', () => {
    it('applies default rounded corners', () => {
      render(
        <Card>
          <p>Content</p>
        </Card>
      );
      const card = screen.getByText('Content').parentElement;
      expect(card).toHaveClass('rounded-xl');
    });
  });

  describe('Accessibility', () => {
    it('renders as a div by default', () => {
      const { container } = render(
        <Card>
          <p>Content</p>
        </Card>
      );
      expect(container.firstChild?.nodeName).toBe('DIV');
    });
  });

  describe('Complex Content', () => {
    it('renders multiple children correctly', () => {
      render(
        <Card>
          <h2>Title</h2>
          <p>Description</p>
          <button>Action</button>
        </Card>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('handles nested components', () => {
      render(
        <Card>
          <div>
            <span>Nested</span>
          </div>
        </Card>
      );

      expect(screen.getByText('Nested')).toBeInTheDocument();
    });
  });
});
