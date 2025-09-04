'use client'

import { useState } from 'react'
import { DeviceSelector } from '@/components/DeviceSelector'

export default function DeviceSelectorDemo() {
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])

  const handleDeviceSelection = (devices: { value: string; label: string }[]) => {
    setSelectedDevices(devices.map(device => device.value))
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Device Screenshot Preview</h1>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Select devices to preview:</label>
          <DeviceSelector onSelectionChange={handleDeviceSelection} />
        </div>

        {selectedDevices.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-4">Preview Screenshots</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedDevices.map(device => {
                // Map device values to their display names
                const deviceName = {
                  'iphone': 'iPhone 14 Pro',
                  'ipad': 'iPad Pro',
                  'macbook': 'MacBook Pro',
                  'desktop': 'Desktop',
                  'samsung': 'Samsung Galaxy'
                }[device] || device

                return (
                  <div 
                    key={device}
                    className="border rounded-lg overflow-hidden bg-card shadow-sm"
                  >
                    <div className="p-3 border-b bg-muted/50">
                      <h3 className="font-medium">{deviceName}</h3>
                    </div>
                    <div className="p-4 bg-background min-h-[300px] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <p>Screenshot preview for</p>
                        <p className="font-medium">{deviceName}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Select devices to view their screenshots</p>
          </div>
        )}
      </div>
    </div>
  )
}
