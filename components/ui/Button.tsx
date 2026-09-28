import { cn } from "@/lib/cn";

type Variant = "default" | "primary" | "ghost";

const variants: Record<Variant, string> = {
  default: "bg-btn text-white hover:bg-btn-hover",
  primary: "bg-btn-primary text-bg-deep hover:bg-btn-primary-hover",
  ghost: "border border-white text-white hover:border-white/50",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export default function Button({ variant = "default", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
