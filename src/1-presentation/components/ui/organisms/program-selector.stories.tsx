import type { Meta, StoryObj } from '@storybook/react';
import { ProgramSelector, Program } from './program-selector';
import { useState } from 'react';

const samplePrograms: Program[] = [
  {
    id: '1',
    name: 'E-İhracat Kayseri 2024',
    city: 'Kayseri',
    status: 'active',
    companyCount: 25,
  },
  {
    id: '2',
    name: 'Dijital Dönüşüm Bursa',
    city: 'Bursa',
    status: 'active',
    companyCount: 18,
  },
  {
    id: '3',
    name: 'E-İhracat Ankara 2023',
    city: 'Ankara',
    status: 'completed',
    companyCount: 30,
  },
  {
    id: '4',
    name: 'Dijital Pazarlama İzmir',
    city: 'İzmir',
    status: 'inactive',
    companyCount: 12,
  },
];

const meta: Meta<typeof ProgramSelector> = {
  title: 'Organisms/ProgramSelector',
  component: ProgramSelector,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProgramSelector>;

export const Default: Story = {
  args: {
    programs: samplePrograms,
    onSelect: (program) => console.log('Selected:', program),
  },
};

export const WithSelected: Story = {
  args: {
    programs: samplePrograms,
    selectedProgram: samplePrograms[0],
    onSelect: (program) => console.log('Selected:', program),
  },
};

export const Interactive: Story = {
  render: function InteractiveProgramSelector() {
    const [selected, setSelected] = useState<Program | undefined>(samplePrograms[0]);

    return (
      <div className="space-y-4">
        <ProgramSelector
          programs={samplePrograms}
          selectedProgram={selected}
          onSelect={setSelected}
        />
        {selected && (
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Selected Program:</h3>
            <p>
              <strong>Name:</strong> {selected.name}
            </p>
            <p>
              <strong>City:</strong> {selected.city}
            </p>
            <p>
              <strong>Status:</strong> {selected.status}
            </p>
            <p>
              <strong>Companies:</strong> {selected.companyCount}
            </p>
          </div>
        )}
      </div>
    );
  },
};

export const FewPrograms: Story = {
  args: {
    programs: samplePrograms.slice(0, 2),
    onSelect: (program) => console.log('Selected:', program),
  },
};
