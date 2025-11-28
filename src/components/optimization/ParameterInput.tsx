import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ParameterInputProps {
  label: string;
  value: number[];
  onChange: (value: number[]) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  tooltip: string;
  constraintMin?: number;
  constraintMax?: number;
}

export const ParameterInput = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  tooltip,
  constraintMin,
  constraintMax
}: ParameterInputProps) => {
  const isOutOfBounds = constraintMin !== undefined && constraintMax !== undefined &&
    (value[0] < constraintMin || value[0] > constraintMax);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">{label}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value[0]}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value);
              if (!isNaN(newValue)) {
                onChange([Math.min(max, Math.max(min, newValue))]);
              }
            }}
            className="w-20 h-8 text-right"
            step={step}
            min={min}
            max={max}
          />
          <span className="text-sm text-muted-foreground min-w-[50px]">{unit}</span>
        </div>
      </div>
      <Slider
        value={value}
        onValueChange={onChange}
        min={min}
        max={max}
        step={step}
        className={`w-full ${isOutOfBounds ? 'opacity-50' : ''}`}
      />
      {constraintMin !== undefined && constraintMax !== undefined && (
        <p className={`text-xs ${isOutOfBounds ? 'text-destructive' : 'text-muted-foreground'}`}>
          Safe range: {constraintMin} - {constraintMax} {unit}
          {isOutOfBounds && ' (Warning: Outside safe operating range!)'}
        </p>
      )}
    </div>
  );
};
