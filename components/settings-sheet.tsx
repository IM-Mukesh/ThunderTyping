"use client"

import { useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Settings } from "@/lib/types"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

const DEFAULT_SETTINGS: Settings = {
  allowBackspacePrev: false,
  theme: "dark",
  font: "sans",
  duration: 60,
}

export function SettingsSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [settings, setSettings] = useLocalStorage<Settings>("typing.settings", DEFAULT_SETTINGS)
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme(settings.theme)
    const root = document.documentElement
    root.classList.remove("font-sans", "font-mono", "font-serif")
    root.classList.add(`font-${settings.font}`)
  }, [settings.theme, settings.font, setTheme])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow-backspace">Backspace into previous word</Label>
              <p className="text-xs text-muted-foreground">Allow deleting into previous word</p>
            </div>
            <Switch
              id="allow-backspace"
              checked={settings.allowBackspacePrev}
              onCheckedChange={(v) => setSettings({ ...settings, allowBackspacePrev: v })}
              aria-label="Toggle backspace into previous word"
            />
          </div>

          <div className="space-y-2">
            <Label>Theme</Label>
            <RadioGroup
              value={settings.theme}
              onValueChange={(v) => setSettings({ ...settings, theme: v as Settings["theme"] })}
              className="grid grid-cols-3 gap-2"
              aria-label="Theme selection"
            >
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light">Light</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark">Dark</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="system" id="theme-system" />
                <Label htmlFor="theme-system">System</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Font</Label>
            <RadioGroup
              value={settings.font}
              onValueChange={(v) => setSettings({ ...settings, font: v as Settings["font"] })}
              className="grid grid-cols-3 gap-2"
              aria-label="Font selection"
            >
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="sans" id="font-sans" />
                <Label htmlFor="font-sans">Sans</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="mono" id="font-mono" />
                <Label htmlFor="font-mono">Mono</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="serif" id="font-serif" />
                <Label htmlFor="font-serif">Serif</Label>
              </div>
            </RadioGroup>
          </div>

          <Button variant="secondary" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
