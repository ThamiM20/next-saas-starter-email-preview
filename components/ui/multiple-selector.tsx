"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type Option = {
  label: string
  value: string
}

interface MultipleSelectorProps {
  options: Option[]
  value: Option[]
  onChange: (value: Option[]) => void
  placeholder?: string
  emptyText?: string
  className?: string
}

const MultipleSelector = React.forwardRef<HTMLButtonElement, MultipleSelectorProps>(({
  options,
  value,
  onChange,
  placeholder = "Select items...",
  emptyText = "No results found.",
  className,
}, ref) => {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (selectedValue: string) => {
    const option = options.find((opt) => opt.value === selectedValue);
    if (!option) return;

    const isSelected = value.some((v) => v.value === selectedValue);
    
    if (isSelected) {
      onChange(value.filter((v) => v.value !== selectedValue));
    } else {
      onChange([...value, option]);
    }
    
    // Don't close the popover when selecting items
    // setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between hover:bg-background", className)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          <span className="truncate">
            {value.length > 0 
              ? `${value.length} device${value.length > 1 ? 's' : ''} selected`
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search devices..." />
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {options.map((option) => {
              const isSelected = value.some((v) => v.value === option.value);
              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className={cn(
                    "cursor-pointer flex items-center w-full",
                    isSelected ? "bg-accent" : ""
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <div className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                    isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                  )}>
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  {option.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
})

MultipleSelector.displayName = "MultipleSelector"

export { MultipleSelector }
