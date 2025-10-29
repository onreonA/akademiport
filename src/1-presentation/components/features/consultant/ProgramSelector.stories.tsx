/**
 * Program Selector Stories
 * Sprint 7: Consultant Management
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ProgramSelector } from './ProgramSelector';
import { ConsultantProgramProvider } from '@/shared/contexts/ConsultantProgramContext';

const meta: Meta<typeof ProgramSelector> = {
  title: 'Features/Consultant/ProgramSelector',
  component: ProgramSelector,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ConsultantProgramProvider>
        <div className="w-full max-w-md">
          <Story />
        </div>
      </ConsultantProgramProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProgramSelector>;

export const Default: Story = {
  args: {},
};

export const WithCallback: Story = {
  args: {
    onProgramChange: (program) => {
      console.log('Program changed:', program);
    },
  },
};

export const CustomClassName: Story = {
  args: {
    className: 'w-96',
  },
};

