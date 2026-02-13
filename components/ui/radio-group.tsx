import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-3", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "group/radio border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-all duration-200 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {/* Dot always in DOM — animate via scale+opacity, never mount/unmount */}
      <span className="relative flex items-center justify-center">
        <CircleIcon
          className={cn(
            "fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2",
            "transition-all duration-200 ease-out",
            "scale-0 opacity-0",
            "group-data-[state=checked]/radio:scale-100 group-data-[state=checked]/radio:opacity-100",
          )}
        />
      </span>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
