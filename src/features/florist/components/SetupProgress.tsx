import { Progress } from "@/components/ui/progress";

interface SetupProgressProps {
  progress: number;
}

export const SetupProgress = ({ progress }: SetupProgressProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Store Setup Progress</h3>
        <span className="text-sm text-muted-foreground">{progress}% Complete</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};