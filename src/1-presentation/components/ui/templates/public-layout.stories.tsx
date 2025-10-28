import type { Meta, StoryObj } from '@storybook/react';
import { PublicLayout } from './public-layout';
import { Button } from '../atoms/button';

const navigation = [
  { label: 'Home', href: '/', active: true },
  { label: 'About', href: '/about' },
  { label: 'Programs', href: '/programs' },
  { label: 'Success Stories', href: '/success-stories' },
  { label: 'Contact', href: '/contact' },
];

const footer = (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
    <div>
      <h3 className="font-semibold mb-4">Akademi Port</h3>
      <p className="text-sm text-muted-foreground">E-İhracat Dönüşüm Platformu</p>
    </div>
    <div>
      <h4 className="font-semibold mb-4">Programs</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>
          <a href="#" className="hover:text-foreground">
            E-İhracat
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-foreground">
            Dijital Dönüşüm
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-foreground">
            Dijital Pazarlama
          </a>
        </li>
      </ul>
    </div>
    <div>
      <h4 className="font-semibold mb-4">Company</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>
          <a href="#" className="hover:text-foreground">
            About Us
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-foreground">
            Careers
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-foreground">
            Contact
          </a>
        </li>
      </ul>
    </div>
    <div>
      <h4 className="font-semibold mb-4">Legal</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>
          <a href="#" className="hover:text-foreground">
            Privacy Policy
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-foreground">
            Terms of Service
          </a>
        </li>
      </ul>
    </div>
  </div>
);

const meta: Meta<typeof PublicLayout> = {
  title: 'Templates/PublicLayout',
  component: PublicLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PublicLayout>;

export const Default: Story = {
  args: {
    navigation,
    onNavigationClick: (href) => console.log('Navigate to:', href),
    onCTAClick: () => console.log('CTA clicked'),
    footer,
    children: (
      <div className="container py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Akademi Port
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">Multi-Program E-İhracat Dönüşüm Platformu</p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">Get Started</Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    ),
  },
};

export const WithoutFooter: Story = {
  args: {
    ...Default.args,
    footer: undefined,
  },
};

export const WithoutCTA: Story = {
  args: {
    ...Default.args,
    showCTA: false,
  },
};

export const LongContent: Story = {
  args: {
    navigation,
    footer,
    children: (
      <div className="container py-16 space-y-16">
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold">About Our Platform</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Akademi Port is a comprehensive e-export transformation platform designed to help
            companies succeed in the digital age.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Feature {i}</h3>
              <p className="text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          ))}
        </section>

        <section className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground">
            Join hundreds of companies transforming their business.
          </p>
          <Button size="lg">Start Your Journey</Button>
        </section>
      </div>
    ),
  },
};
