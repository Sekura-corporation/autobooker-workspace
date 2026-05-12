interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  fullScreen?: boolean;
}

export default function Spinner({
  size = "md",
  color = "border-[#820000]",
  fullScreen = false,
}: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const spinner = (
    <div
      className={`border-4 border-gray-200 ${color} rounded-full animate-spin ${sizeClasses[size]}`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
