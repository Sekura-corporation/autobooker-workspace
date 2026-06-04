import { useEffect, useState, type ImgHTMLAttributes } from "react";

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  initials?: string;
  size?: "sm" | "md" | "lg";
  bgColor?: string;
}

export default function Avatar({
  initials,
  size = "md",
  bgColor = "bg-[#820000]",
  src,
  className = "",
  ...props
}: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  if (src && !imageFailed) {
    return (
      <img
        src={src}
        alt={initials ? `Avatar de ${initials}` : "Avatar"}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
        onError={() => setImageFailed(true)}
        {...props}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-black ${bgColor} ${sizeClasses[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
