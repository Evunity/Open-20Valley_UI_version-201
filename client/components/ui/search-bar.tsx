import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  containerClassName?: string;
}

export function SearchBar({ className, containerClassName, ...props }: SearchBarProps) {
  return (
    <div className={cn("search-bar", containerClassName)}>
      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
      <input type="text" className={cn("search-bar-input", className)} {...props} />
    </div>
  );
}

