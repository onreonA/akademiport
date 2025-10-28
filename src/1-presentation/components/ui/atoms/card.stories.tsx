import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';

const meta: Meta<typeof Card> = {
  title: 'UI/Atoms/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

// Basic Card
export const Basic: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. This is a simple card example.</p>
      </CardContent>
    </Card>
  ),
};

// Card with Footer
export const WithFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create Project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Enter your project details below.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
};

// Card with Gradient
export const WithGradient: Story = {
  render: () => (
    <Card className="w-[350px] bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
      <CardHeader>
        <CardTitle>🎉 Sprint 1 İlerleme</CardTitle>
        <CardDescription>Tamamlanan görevler</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <span>Next.js 16 + TypeScript</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <span>Tailwind CSS + Shadcn/ui</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <span>6 Katmanlı Mimari</span>
        </div>
      </CardContent>
    </Card>
  ),
};

// Stats Card
export const Stats: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">$45,231.89</div>
        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
      </CardContent>
    </Card>
  ),
};

// Interactive Card
export const Interactive: Story = {
  render: () => (
    <Card className="w-[350px] hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle>Hover Me!</CardTitle>
        <CardDescription>This card has hover effects</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Hover over this card to see the shadow effect.</p>
      </CardContent>
    </Card>
  ),
};
