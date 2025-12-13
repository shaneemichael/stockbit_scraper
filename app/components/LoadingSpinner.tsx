export default function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex justify-center items-center py-8">
      <div
        className={`${sizeClasses[size]} border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin`}
      />
    </div>
  );
}
