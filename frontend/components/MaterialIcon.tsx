import { SVGProps } from "react";

interface MaterialIconProps extends SVGProps<SVGSVGElement> {
  name: string;
  filled?: boolean;
  className?: string;
}

export default function MaterialIcon({ name, filled = false, className = "" }: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? "material-symbols-filled" : ""} ${className}`}
      style={{ fontVariationSettings: filled ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : undefined }}
    >
      {name}
    </span>
  );
}