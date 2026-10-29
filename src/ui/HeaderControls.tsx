"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Theme } from "@/persistence/store";
import { updateStore, useStore } from "@/persistence/use-store";
import { SettingsIcon, SoundOffIcon, SoundOnIcon } from "./Icons";
import { playSound } from "./sound";

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "system", label: "Match device" },
  { value: "light", label: "Light mat" },
  { value: "dark", label: "Night mat" },
];

function SoundToggle() {
  const { prefs } = useStore();
  return (
    <button
      type="button"
      className="btn press btn-icon sm:w-auto sm:px-3"
      aria-pressed={prefs.sound}
      onClick={() => {
        updateStore((s) => ({ ...s, prefs: { ...s.prefs, sound: !s.prefs.sound } }));
        playSound("clack");
      }}
    >
      {prefs.sound ? <SoundOnIcon /> : <SoundOffIcon />}
      <span className="sr-only sm:not-sr-only">{prefs.sound ? "Sound on" : "Sound off"}</span>
    </button>
  );
}

function SettingsMenu() {
  const { prefs } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setIsOpen(false);
      buttonRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="btn press btn-icon"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((v) => !v)}
      >
        <SettingsIcon />
        <span className="sr-only">Settings</span>
      </button>
      <div id={panelId} hidden={!isOpen} className="panel absolute right-0 top-[calc(100%+10px)] z-40 w-[260px] p-4">
        <fieldset>
          <legend className="type-label mb-2">Theme</legend>
          <div className="flex flex-col gap-1">
            {THEME_OPTIONS.map((o) => (
              <label key={o.value} className="flex min-h-[40px] cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="om-theme"
                  value={o.value}
                  checked={prefs.theme === o.value}
                  onChange={() => updateStore((s) => ({ ...s, prefs: { ...s.prefs, theme: o.value } }))}
                  className="h-5 w-5 accent-black"
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-3 border-t-[3px] border-ink pt-3">
          <label className="flex min-h-[40px] cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={prefs.colorAssist}
              onChange={() => updateStore((s) => ({ ...s, prefs: { ...s.prefs, colorAssist: !s.prefs.colorAssist } }))}
              className="h-5 w-5 accent-black"
            />
            <span>
              <span className="type-label block">Color assist</span>
              <span className="type-small">Adds B, P and Y inside each piece</span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

export function HeaderControls() {
  return (
    <div className="flex items-center gap-3">
      <SoundToggle />
      <SettingsMenu />
    </div>
  );
}
