import { cn } from "@/lib/utils";

interface DashboardLogoProps {
  collapsed: boolean;
}

export const DashboardLogo = ({ collapsed }: DashboardLogoProps) => {
  return (
    <div className="h-24 flex items-center justify-center border-b border-gray-100">
      <h1 className={cn("font-semibold", collapsed ? "hidden" : "block")}>
        Market Bloom
      </h1>
    </div>
  );
};