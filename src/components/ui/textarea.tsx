import * as React from "react"

import { cn } from "@/lib/utils"
import { useMobileInputFocus } from "@/hooks/useMobileInputFocus"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  disableMobileFocus?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, disableMobileFocus = false, onFocus, ...props }, ref) => {
    const { getInputProps } = useMobileInputFocus({ enabled: !disableMobileFocus });
    const mobileProps = getInputProps();

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      // Call mobile focus handler first
      mobileProps.onFocus(e);
      // Then call any custom onFocus handler
      onFocus?.(e);
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onFocus={handleFocus}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
