import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Atoms/Accordion',
  component: Accordion,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Single: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other components aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It's animated by default, but you can disable it if you prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>
          Content for section 1. Multiple sections can be open at the same time.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>
          Content for section 2. Multiple sections can be open at the same time.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Section 3</AccordionTrigger>
        <AccordionContent>
          Content for section 3. Multiple sections can be open at the same time.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const FAQ: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="faq-1">
        <AccordionTrigger>What is Akademi Port?</AccordionTrigger>
        <AccordionContent>
          Akademi Port is a multi-program e-export transformation platform that helps companies in
          their digital transformation journey.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-2">
        <AccordionTrigger>How does the program work?</AccordionTrigger>
        <AccordionContent>
          The program consists of a 12-month structured process with AI-powered support, training
          modules, and consultant guidance.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-3">
        <AccordionTrigger>Who can join the program?</AccordionTrigger>
        <AccordionContent>
          Companies looking to expand their e-export capabilities and undergo digital transformation
          can apply to join the program.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-4">
        <AccordionTrigger>What support is provided?</AccordionTrigger>
        <AccordionContent>
          Participants receive dedicated consultant support, AI-powered tools, training materials,
          and regular progress tracking.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
