import * as React from "react"

import { cn } from "@/lib/utils"
import { useMobileInputFocus } from "@/hooks/useMobileInputFocus"

export interface InputProps extends React.ComponentProps<"input"> {
  disableMobileFocus?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, disableMobileFocus = false, onFocus, ...props }, ref) => {
    const { getInputProps } = useMobileInputFocus({ enabled: !disableMobileFocus });
    const mobileProps = getInputProps();

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Call mobile focus handler first
      mobileProps.onFocus(e);
      // Then call any custom onFocus handler
      onFocus?.(e);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onFocus={handleFocus}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
