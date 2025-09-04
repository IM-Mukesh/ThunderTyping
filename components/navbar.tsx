"use client";

export function NavBar() {
  return (
    <header className="w-full border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-sm">
      <div className="flex px-6 py-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur-sm" />
          <h1 className="relative text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            ThunderTyping
          </h1>
        </div>
      </div>
    </header>
  );
}
