"use client";
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/core/config/utils";
import { getSFProTextClasses } from "@/core/config/theme-utils";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      getSFProTextClasses('label', 'neutral'),
      "leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
