import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { buttonVariants, ButtonVariantProps } from "./buttonStyles";
import { useHaptics } from "@/hooks/useHaptics";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {
  asChild?: boolean;
  haptic?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, haptic = false, onClick, ...props }, ref) => {
    const { triggerImpact } = useHaptics();
    const Comp = asChild ? Slot : "button";
    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (haptic) triggerImpact("light");
      if (onClick) onClick(e);
    };
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

// Example usage:
// <Button haptic onClick={() => alert('Clicked!')}>Tap me</Button>
