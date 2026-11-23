import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        {
          "bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600": variant === "primary",
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-slate-500": variant === "secondary",
          "text-slate-600 hover:bg-slate-100 focus-visible:outline-slate-500": variant === "ghost",
          "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600": variant === "danger",
        },
        className,
      )}
      {...props}
    />
  );
});
