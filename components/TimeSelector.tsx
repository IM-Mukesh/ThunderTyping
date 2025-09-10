"use client";

import { cn } from "@/lib/utils";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Settings, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRESETS = [15, 30, 60, 120]; // seconds

interface TimeSelectorProps {
  duration: number;
  onDurationChange: (duration: number) => void;
  disabled?: boolean;
}

interface CustomTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (seconds: number) => void;
  currentDuration: number;
}

interface TimeInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isValid: boolean;
  previewTime: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  errorMessage?: string;
}

interface ParseTimeResult {
  seconds: number;
  timeString: string;
  error?: string;
}

// Utility functions for time conversion and formatting
function secondsToTimeString(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  let result = `${hours}h`;
  if (mins > 0) result += ` ${mins}m`;
  if (secs > 0) result += ` ${secs}s`;
  return result;
}

function parseTimeInput(input: string): ParseTimeResult | null {
  if (!input || !input.trim()) return null;
  const raw = input.trim().toLowerCase();

  // Accept formats:
  // - plain number -> treat as seconds (e.g. "90" => 90s)
  // - with suffix: "s", "m", "h" (e.g. "90s", "3m", "1.5h")
  // - optionally allow spaces: "1 h 30 m" is not fully supported by this simple parser
  // Keep parser simple and deterministic.

  // If input contains any letter unit, parse unit-aware
  const unitMatch = raw.match(/^([\d.]+)\s*([smh])$/);
  if (unitMatch) {
    const num = Number(unitMatch[1]);
    if (isNaN(num) || num <= 0) return null;
    const unit = unitMatch[2];

    let seconds = 0;
    if (unit === "s") seconds = Math.round(num);
    else if (unit === "m") seconds = Math.round(num * 60);
    else if (unit === "h") seconds = Math.round(num * 3600);

    if (seconds > 36000) {
      return {
        seconds,
        timeString: secondsToTimeString(seconds),
        error: "Maximum duration is 10 hours (36000 seconds)",
      };
    }
    return { seconds, timeString: secondsToTimeString(seconds) };
  }

  // If raw is plain number (no unit), treat as seconds by default
  const asNum = Number(raw);
  if (!isNaN(asNum) && asNum > 0) {
    const seconds = Math.round(asNum);
    if (seconds > 36000) {
      return {
        seconds,
        timeString: secondsToTimeString(seconds),
        error: "Maximum duration is 10 hours (36000 seconds)",
      };
    }
    return { seconds, timeString: secondsToTimeString(seconds) };
  }

  // For anything else return null (invalid)
  return null;
}

// Random corner animation variants
const createRandomCornerVariants = () => {
  const corners = [
    { x: "-100vw", y: "-100vh" },
    { x: "100vw", y: "-100vh" },
    { x: "-100vw", y: "100vh" },
    { x: "100vw", y: "100vh" },
  ];

  const enterCorner = corners[Math.floor(Math.random() * corners.length)];
  const exitCorner = corners[Math.floor(Math.random() * corners.length)];

  return {
    hidden: {
      opacity: 0,
      x: enterCorner.x,
      y: enterCorner.y,
      scale: 0.3,
      rotate: Math.random() > 0.5 ? 180 : -180,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
    },
    exit: {
      opacity: 0,
      x: exitCorner.x,
      y: exitCorner.y,
      scale: 0.3,
      rotate: Math.random() > 0.5 ? 180 : -180,
    },
  };
};

// Preset Button Component
const PresetButton = ({
  preset,
  isActive,
  disabled,
  onClick,
}: {
  preset: number;
  isActive: boolean;
  disabled: boolean;
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    whileHover={!disabled ? { scale: 1.05, y: -1 } : {}}
    whileTap={!disabled ? { scale: 0.95 } : {}}
    className={cn(
      "h-8 px-3 cursor-pointer rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 relative overflow-hidden",
      isActive
        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30"
        : "bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-200 hover:text-white border border-neutral-600/40 hover:border-neutral-500/60 backdrop-blur-sm",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    <span className="relative z-10">{preset}</span>
    {isActive && (
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    )}
  </motion.button>
);

// Custom Button Component
const CustomButton = ({
  isCustomDuration,
  displayTime,
  disabled,
  onClick,
}: {
  isCustomDuration: boolean;
  displayTime: string;
  disabled: boolean;
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    whileHover={!disabled ? { scale: 1.05, y: -1 } : {}}
    whileTap={!disabled ? { scale: 0.95 } : {}}
    className={cn(
      "h-8 px-3 cursor-pointer rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 flex items-center gap-2 relative overflow-hidden",
      isCustomDuration
        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
        : "bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-200 hover:text-white border border-neutral-600/40 hover:border-neutral-500/60 backdrop-blur-sm",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    <Settings className="w-3.5 h-3.5" />
    <span className="relative z-10">
      {isCustomDuration ? displayTime : "Custom"}
    </span>
    {isCustomDuration && (
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    )}
  </motion.button>
);

// Quick Presets Component
const QuickPresets = ({
  onPresetClick,
}: {
  onPresetClick: (seconds: number) => void;
}) => {
  const quickPresets = [
    { seconds: 180, label: "3m" },
    { seconds: 300, label: "5m" },
    { seconds: 600, label: "10m" },
    { seconds: 1800, label: "30m" },
    { seconds: 3600, label: "1h" },
  ];

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-neutral-300 flex items-center gap-2">
        <span>Quick:</span>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {quickPresets.map(({ seconds, label }) => (
          <motion.button
            key={seconds}
            onClick={() => onPresetClick(seconds)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 h-8 px-3 bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-300 hover:text-white text-xs font-medium rounded-lg border border-neutral-600/40 hover:border-neutral-500/60 transition-all duration-150 backdrop-blur-sm"
          >
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Time Input Component with proper TypeScript interface
const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  onKeyDown,
  isValid,
  previewTime,
  inputRef,
  errorMessage,
}) => (
  <div className="space-y-2">
    <div className="relative">
      <input
        ref={inputRef}
        type="number"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="e.g. 90, 300, 1800..."
        min="1"
        max="36000"
        autoFocus
        className={cn(
          "w-full h-12 px-4 bg-neutral-800/80 border-2 rounded-xl text-white text-lg font-medium placeholder:text-neutral-500 transition-all duration-200 focus:outline-none backdrop-blur-sm",
          isValid
            ? "border-neutral-600 focus:border-cyan-400 focus:bg-neutral-800"
            : "border-red-500/60 focus:border-red-400"
        )}
      />
      {/* Real-time preview */}
      <AnimatePresence>
        {previewTime && !errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm",
              isValid
                ? "text-cyan-400 bg-cyan-500/10"
                : "text-red-400 bg-red-500/10"
            )}
          >
            {previewTime}
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Error message */}
    <AnimatePresence>
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-red-400 text-sm font-medium">Too long!</p>
            <p className="text-red-300/80 text-xs mt-1">{errorMessage}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Main Modal Component
function CustomTimeModal({
  isOpen,
  onClose,
  onConfirm,
  currentDuration,
}: CustomTimeModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [previewTime, setPreviewTime] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [animationVariants, setAnimationVariants] = useState(() =>
    createRandomCornerVariants()
  );

  useEffect(() => {
    if (isOpen) {
      setAnimationVariants(createRandomCornerVariants());
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setInputValue(currentDuration.toString());
      setPreviewTime(secondsToTimeString(currentDuration));
      setIsValid(true);
      setErrorMessage("");

      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isOpen, currentDuration]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      if (!value.trim()) {
        setPreviewTime("");
        setIsValid(true);
        setErrorMessage("");
        return;
      }

      const parsed = parseTimeInput(value);
      if (parsed) {
        setPreviewTime(parsed.timeString);
        if (parsed.error) {
          setIsValid(false);
          setErrorMessage(parsed.error);
        } else {
          setIsValid(true);
          setErrorMessage("");
        }
      } else {
        setPreviewTime("Invalid input");
        setIsValid(false);
        setErrorMessage("Please enter a valid positive number");
      }
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (!inputValue.trim() || !isValid || errorMessage) return;

    const parsed = parseTimeInput(inputValue);
    if (parsed && !parsed.error && parsed.seconds <= 36000) {
      onConfirm(parsed.seconds);
      onClose();
    }
  }, [inputValue, isValid, errorMessage, onConfirm, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && isValid && inputValue.trim() && !errorMessage) {
        handleConfirm();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [handleConfirm, isValid, inputValue, errorMessage, onClose]
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  const handlePresetClick = useCallback((seconds: number) => {
    setInputValue(seconds.toString());
    setPreviewTime(secondsToTimeString(seconds));
    setIsValid(true);
    setErrorMessage("");
  }, []);

  const isOkEnabled = isValid && inputValue.trim() && !errorMessage;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          <motion.div
            ref={modalRef}
            variants={animationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              mass: 0.8,
            }}
            className="relative w-full max-w-sm bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 border border-neutral-600/50 rounded-2xl shadow-2xl shadow-black/50"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-xl -z-10" />

            <div className="relative p-6 pb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Clock className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-white">Set Time</h2>
                  <p className="text-neutral-400 text-sm">
                    Enter any number - we'll convert it smartly
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <TimeInput
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                isValid={isValid}
                previewTime={previewTime}
                inputRef={inputRef}
                errorMessage={errorMessage}
              />

              <QuickPresets onPresetClick={handlePresetClick} />

              <motion.button
                onClick={handleConfirm}
                disabled={!isOkEnabled}
                whileHover={{ scale: !isOkEnabled ? 1 : 1.02 }}
                whileTap={{ scale: !isOkEnabled ? 1 : 0.98 }}
                className={cn(
                  "w-full h-12 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg relative overflow-hidden",
                  isOkEnabled
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-cyan-500/30 cursor-pointer"
                    : "bg-neutral-700/60 text-neutral-500 cursor-not-allowed shadow-none"
                )}
              >
                <span className="relative z-10">
                  {errorMessage ? "Fix errors above" : "OK"}
                </span>
                {isOkEnabled && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Main TimeSelector Component
export default function TimeSelector({
  duration,
  onDurationChange,
  disabled = false,
}: TimeSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isCustomDuration = !PRESETS.includes(duration);

  const handleOpenModal = useCallback(() => {
    if (!disabled) {
      setIsModalOpen(true);
    }
  }, [disabled]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleCustomConfirm = useCallback(
    (seconds: number) => {
      onDurationChange(seconds);
    },
    [onDurationChange]
  );

  const displayTime = useMemo(() => {
    if (isCustomDuration) {
      return secondsToTimeString(duration);
    }
    return duration.toString();
  }, [duration, isCustomDuration]);

  return (
    <>
      <div className="space-y-3 w-full">
        <div className="flex items-center justify-center gap-2">
          {PRESETS.map((p) => (
            <PresetButton
              key={p}
              preset={p}
              isActive={p === duration}
              disabled={disabled}
              onClick={() => onDurationChange(p)}
            />
          ))}

          <CustomButton
            isCustomDuration={isCustomDuration}
            displayTime={displayTime}
            disabled={disabled}
            onClick={handleOpenModal}
          />
        </div>
      </div>

      <CustomTimeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleCustomConfirm}
        currentDuration={duration}
      />
    </>
  );
}
