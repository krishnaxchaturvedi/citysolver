import * as React from "react"
import { cn } from "@/lib/utils"

function Avatar({ className, ...props }: React.ComponentProps<"img">) {
  return (
    <img
      data-slot="avatar"
      className={cn("size-10 rounded-full object-cover ring-2 ring-border", className)}
      {...props}
    />
  )
}

export { Avatar }
