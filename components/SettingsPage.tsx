import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  setCurrentFillColor,
  setLanguage,
  addColor,
  removeColor,
} from "@/store/slices/settingsSlice";
import {
  Settings,
  Palette,
  Globe,
  Plus,
  X,
  Check,
  Zap,
  ArrowLeft,
} from "lucide-react";

// Mock data for languages (you can expand this)
const availableLanguages = [
  { code: "english", name: "English", flag: "🇺🇸" },
  // { code: "spanish", name: "Español", flag: "🇪🇸" },
  // { code: "french", name: "Français", flag: "🇫🇷" },
  // { code: "german", name: "Deutsch", flag: "🇩🇪" },
  // { code: "italian", name: "Italiano", flag: "🇮🇹" },
  // { code: "portuguese", name: "Português", flag: "🇵🇹" },
  // { code: "russian", name: "Русский", flag: "🇷🇺" },
  // { code: "japanese", name: "日本語", flag: "🇯🇵" },
  // { code: "korean", name: "한국어", flag: "🇰🇷" },
  // { code: "chinese", name: "中文", flag: "🇨🇳" },
];

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { fillColors, currentFillColor, language } = useAppSelector(
    (state) => state.settings
  );
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColorHex, setNewColorHex] = useState("#FFFFFF");
  const [searchLanguage, setSearchLanguage] = useState("");

  const handleColorSelect = (colorCode: string) => {
    dispatch(setCurrentFillColor(colorCode));
  };

  const handleLanguageSelect = (languageCode: string) => {
    dispatch(setLanguage(languageCode));
  };

  const handleAddColor = () => {
    const newColor = {
      code: newColorHex,
      className: `text-white bg-[${newColorHex}]`,
    };
    dispatch(addColor(newColor));
    setShowColorPicker(false);
    setNewColorHex("#FFFFFF");
  };

  const handleRemoveColor = (colorCode: string) => {
    if (fillColors && fillColors.length > 1) {
      // Keep at least one color
      dispatch(removeColor(colorCode));
      // If we're removing the currently selected color, select the first remaining color
      if (currentFillColor === colorCode) {
        const remainingColors = fillColors.filter((c) => c?.code !== colorCode);
        if (remainingColors.length > 0 && remainingColors[0]?.code) {
          dispatch(setCurrentFillColor(remainingColors[0].code));
        }
      }
    }
  };

  const filteredLanguages = availableLanguages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchLanguage.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchLanguage.toLowerCase())
  );

  const getColorPreview = (color: any) => {
    if (!color || !color.code) {
      return (
        <div className="w-8 h-8 rounded-lg bg-neutral-600 border border-neutral-500" />
      );
    }

    if (color.code.includes("gradient")) {
      return (
        <div
          className={`w-8 h-8 rounded-lg ${color.className} flex items-center justify-center`}
        >
          <span className="text-xs font-bold">Aa</span>
        </div>
      );
    } else {
      return (
        <div
          className="w-8 h-8 rounded-lg border border-neutral-600"
          style={{ backgroundColor: color.code }}
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-neutral-800/50 backdrop-blur-sm bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            {/* <button className="p-2 rounded-xl bg-neutral-800/50 hover:bg-neutral-700/50 transition-all duration-300 backdrop-blur-sm border border-neutral-700/50">
              <ArrowLeft className="w-5 h-5" />
            </button> */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <Settings className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-neutral-400 text-sm">
                  Customize your typing experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Theme Colors Section */}
          <div className="group">
            <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6 hover:border-neutral-700/50 transition-all duration-500 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                  <Palette className="w-5 h-5 text-violet-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  Word Fill Colors
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {fillColors && fillColors.length > 0 ? (
                  fillColors.map((color, index) => (
                    <div
                      key={color?.code || index}
                      className="relative group/color"
                    >
                      {/* Color selection area - changed from button to div */}
                      <div
                        onClick={() =>
                          color?.code && handleColorSelect(color.code)
                        }
                        className={`w-full h-16 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center relative overflow-hidden cursor-pointer ${
                          currentFillColor === color?.code
                            ? "border-cyan-400 shadow-cyan-400/25 shadow-lg"
                            : "border-neutral-700 hover:border-neutral-600"
                        } ${!color?.code ? "cursor-not-allowed" : ""}`}
                      >
                        {getColorPreview(color)}

                        {/* Selection indicator */}
                        {currentFillColor === color?.code && (
                          <div className="absolute top-1 right-1 bg-cyan-400 rounded-full p-1">
                            <Check className="w-3 h-3 text-black" />
                          </div>
                        )}

                        {/* Remove button - now as a separate positioned element */}
                        {fillColors.length > 1 && color?.code && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveColor(color.code);
                            }}
                            className="absolute top-1 left-1 bg-red-500 rounded-full p-1 opacity-0 group-hover/color:opacity-100 transition-opacity duration-200 z-10"
                            type="button"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-neutral-400 py-8">
                    No colors available
                  </div>
                )}

                {/* Add new color button */}
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-full h-16 rounded-xl border-2 border-dashed border-neutral-700 hover:border-cyan-400 transition-all duration-300 hover:scale-105 flex items-center justify-center group/add"
                  type="button"
                >
                  <Plus className="w-6 h-6 text-neutral-500 group-hover/add:text-cyan-400 transition-colors" />
                </button>
              </div>

              {/* Color picker */}
              {showColorPicker && (
                <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-12 h-12 rounded-lg border border-neutral-600 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      placeholder="#FFFFFF"
                      className="flex-1 bg-neutral-900/50 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:border-cyan-400 focus:outline-none transition-colors"
                    />
                    <button
                      onClick={handleAddColor}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium"
                      type="button"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Language Selection Section */}
          <div className="group">
            <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6 hover:border-neutral-700/50 transition-all duration-500 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30">
                  <Globe className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Language</h2>
              </div>

              {/* Search languages */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={searchLanguage}
                  onChange={(e) => setSearchLanguage(e.target.value)}
                  className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:border-emerald-400 focus:outline-none transition-all duration-300"
                />
              </div>

              <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {filteredLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`cursor-pointer w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 transform-gpu origin-left will-change-transform hover:scale-[1.01] ${
                      language === lang.code
                        ? "bg-emerald-500/10 border-emerald-400 shadow-emerald-400/20" // reduced shadow
                        : "bg-neutral-800/30 border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/50"
                    }`}
                    type="button"
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium text-white">{lang.name}</span>
                    {language === lang.code && (
                      <div className="ml-auto bg-emerald-400 rounded-full p-1">
                        <Check className="w-3 h-3 text-black" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Stats Preview */}
        <div className="mt-8 bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Preview</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-1">72</div>
              <div className="text-neutral-400 text-sm">WPM</div>
            </div>
            <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-1">
                99%
              </div>
              <div className="text-neutral-400 text-sm">Accuracy</div>
            </div>
            <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-400 mb-1">15s</div>
              <div className="text-neutral-400 text-sm">Duration</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-neutral-800/20 rounded-xl border border-neutral-700/30">
            <p
              className={`text-lg leading-relaxed ${
                currentFillColor && currentFillColor.includes("gradient")
                  ? fillColors.find((c) => c?.code === currentFillColor)
                      ?.className || "text-white"
                  : "text-white"
              }`}
              style={
                currentFillColor && !currentFillColor.includes("gradient")
                  ? { color: currentFillColor }
                  : {}
              }
            >
              The quick brown fox jumps over the lazy dog. This preview shows
              how your selected theme will appear during typing tests.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(64, 64, 64, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.7);
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
