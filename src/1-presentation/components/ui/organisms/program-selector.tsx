import * as React from 'react';
import { cn } from '@/presentation/lib/utils';
import { Button } from '../atoms/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../atoms/dropdown-menu';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Badge } from '../atoms/badge';

export interface Program {
  id: string;
  name: string;
  city: string;
  status: 'active' | 'inactive' | 'completed';
  companyCount?: number;
}

export interface ProgramSelectorProps {
  programs: Program[];
  selectedProgram?: Program;
  onSelect: (program: Program) => void;
  className?: string;
}

const ProgramSelector = React.forwardRef<HTMLDivElement, ProgramSelectorProps>(
  ({ programs, selectedProgram, onSelect, className }, ref) => {
    const getStatusBadge = (status: Program['status']) => {
      const variants = {
        active: 'default',
        inactive: 'secondary',
        completed: 'outline',
      } as const;

      return (
        <Badge variant={variants[status]} className="ml-auto">
          {status}
        </Badge>
      );
    };

    return (
      <div ref={ref} className={cn('w-full', className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" role="combobox" className="w-full justify-between">
              {selectedProgram ? (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedProgram.name}</span>
                  <span className="text-muted-foreground text-sm">({selectedProgram.city})</span>
                </div>
              ) : (
                'Select program...'
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[400px]">
            <DropdownMenuLabel>Select Program</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {programs.map((program) => (
              <DropdownMenuItem
                key={program.id}
                onClick={() => onSelect(program)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {selectedProgram?.id === program.id && <Check className="h-4 w-4" />}
                  <div className="flex flex-col">
                    <span className="font-medium">{program.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {program.city}
                      {program.companyCount !== undefined && ` • ${program.companyCount} companies`}
                    </span>
                  </div>
                </div>
                {getStatusBadge(program.status)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
);
ProgramSelector.displayName = 'ProgramSelector';

export { ProgramSelector };
