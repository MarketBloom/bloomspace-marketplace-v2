interface CollapseButtonProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const CollapseButton = ({ collapsed, onToggle }: CollapseButtonProps) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <svg
        className={`w-6 h-6 transition-transform duration-200 ${
          collapsed ? "transform rotate-180" : ""
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
};

export type { CollapseButtonProps };