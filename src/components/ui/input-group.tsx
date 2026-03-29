import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
    return <div className={cn("space-y-1", className)} {...props} />;
}

export function InputGroupTextarea(props: React.ComponentProps<typeof Textarea>) {
    return <Textarea {...props} />;
}

export function InputGroupAddon({ className, ...props }: React.ComponentProps<"div">) {
    return <div className={cn("flex justify-end", className)} {...props} />;
}

export function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
    return <span className={cn("text-xs text-muted-foreground", className)} {...props} />;
}
