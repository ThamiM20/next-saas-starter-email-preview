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

type Device = {
  value: string
  label: string
}

const devices: Device[] = [
  {
    value: "iphone15",
    label: "iPhone 15",
  },
  {
    value: "samsungS24Ultra",
    label: "Samsung Galaxy S24 Ultra",
  },
  {
    value: "pixel8Pro",
    label: "Google Pixel 8 Pro",
  },
  {
    value: "ipad",
    label: "iPad Pro",
  },
  {
    value: "macbookPro16",
    label: "MacBook Pro 16\"",
  },
  {
    value: "surfacePro",
    label: "Microsoft Surface Pro",
  },
  {
    value: "desktop",
    label: "Desktop",
  },
]

interface DeviceSelectorProps {
  onSelectionChange?: (devices: Device[]) => void
  defaultValue?: string[]
}

export function DeviceSelector({ onSelectionChange, defaultValue = [] }: DeviceSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDevices, setSelectedDevices] = React.useState<Device[]>(
    devices.filter(device => defaultValue.includes(device.value))
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedDevices.length > 0 
            ? `${selectedDevices.length} device(s) selected` 
            : "Select devices..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search devices..." />
          <CommandEmpty>No device found.</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {devices.map((device) => (
              <CommandItem
                key={device.value}
                onSelect={() => {
                  const newSelection = selectedDevices.some((d) => d.value === device.value)
                    ? selectedDevices.filter((d) => d.value !== device.value)
                    : [...selectedDevices, device]
                  setSelectedDevices(newSelection)
                  onSelectionChange?.(newSelection)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedDevices.some((d) => d.value === device.value)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {device.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
