import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import CodeBlock from '@/components/ui/CodeBlock';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

describe('CodeBlock Component', () => {
  const sampleCode = `const hello = 'world';
console.log(hello);`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders code content correctly', () => {
      render(<CodeBlock code={sampleCode} />);
      expect(screen.getByText(/const hello = 'world'/)).toBeInTheDocument();
    });

    it('renders with title when provided', () => {
      render(<CodeBlock code={sampleCode} title='example.ts' />);
      expect(screen.getByText('example.ts')).toBeInTheDocument();
    });

    it('renders without title when not provided', () => {
      render(<CodeBlock code={sampleCode} />);
      expect(screen.queryByText(/\.tsx$/)).not.toBeInTheDocument();
    });

    it('displays language label when title is provided', () => {
      render(<CodeBlock code={sampleCode} title='test.tsx' language='tsx' />);
      expect(screen.getByText('tsx')).toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    it('shows copy button on hover', () => {
      const { container } = render(<CodeBlock code={sampleCode} />);
      const copyButton = container.querySelector('button');
      expect(copyButton).toBeInTheDocument();
      expect(copyButton).toHaveTextContent('Copy');
    });

    it('copies code to clipboard when copy button is clicked', async () => {
      const { container } = render(<CodeBlock code={sampleCode} />);
      const copyButton = container.querySelector('button');

      if (copyButton) {
        fireEvent.click(copyButton);
      }

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(sampleCode);
      });
    });

    it('shows "Copied!" message after successful copy', async () => {
      const { container } = render(<CodeBlock code={sampleCode} />);
      const copyButton = container.querySelector('button');

      if (copyButton) {
        fireEvent.click(copyButton);
      }

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('resets copied state after 2 seconds', async () => {
      jest.useFakeTimers();
      const { container } = render(<CodeBlock code={sampleCode} />);
      const copyButton = container.querySelector('button');

      if (copyButton) {
        fireEvent.click(copyButton);
      }

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
        expect(screen.getByText('Copy')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Styling', () => {
    it('applies dark background to code block', () => {
      const { container } = render(<CodeBlock code={sampleCode} />);
      const pre = container.querySelector('pre');
      expect(pre).toHaveClass('bg-gray-900');
    });

    it('applies monospace font to code', () => {
      const { container } = render(<CodeBlock code={sampleCode} />);
      const code = container.querySelector('code');
      expect(code).toHaveClass('font-mono');
    });

    it('applies correct border radius when title is present', () => {
      const { container } = render(
        <CodeBlock code={sampleCode} title='test.tsx' />
      );
      const pre = container.querySelector('pre');
      expect(pre).toHaveClass('rounded-b-lg');
      expect(pre).not.toHaveClass('rounded-t-lg');
    });

    it('applies correct border radius when title is not present', () => {
      const { container } = render(<CodeBlock code={sampleCode} />);
      const pre = container.querySelector('pre');
      expect(pre).toHaveClass('rounded-t-lg', 'rounded-b-lg');
    });
  });

  describe('Language Support', () => {
    it('defaults to tsx language', () => {
      render(<CodeBlock code={sampleCode} title='test' />);
      expect(screen.getByText('tsx')).toBeInTheDocument();
    });

    it('displays custom language when provided', () => {
      render(
        <CodeBlock code={sampleCode} title='test' language='javascript' />
      );
      expect(screen.getByText('javascript')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic HTML structure', () => {
      const { container } = render(<CodeBlock code={sampleCode} />);
      const pre = container.querySelector('pre');
      const code = pre?.querySelector('code');

      expect(pre).toBeInTheDocument();
      expect(code).toBeInTheDocument();
    });

    it('copy button is keyboard accessible', () => {
      const { container } = render(<CodeBlock code={sampleCode} />);
      const button = container.querySelector('button');

      expect(button?.tagName).toBe('BUTTON');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty code string', () => {
      const { container } = render(<CodeBlock code='' />);
      const code = container.querySelector('code');
      expect(code?.textContent).toBe('');
    });

    it('handles very long code', () => {
      const longCode = 'const x = 1;\n'.repeat(100);
      render(<CodeBlock code={longCode} />);
      expect(screen.getByText(/const x = 1;/)).toBeInTheDocument();
    });

    it('handles special characters in code', () => {
      const specialCode = `const regex = /[a-z]+/g;
const html = '<div>Test</div>';`;
      render(<CodeBlock code={specialCode} />);
      expect(screen.getByText(/const regex/)).toBeInTheDocument();
    });
  });
});
