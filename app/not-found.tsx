// app/not-found.tsx
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "404 — Page not found • ThunderTyping",
  description: "This page could not be found. Return to ThunderTyping home.",
};

export default function NotFound() {
  return (
    <main
      className="relative flex items-center justify-center w-full min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white"
      role="main"
      aria-labelledby="notfound-heading"
    >
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-pulse"></div>
      </div>

      {/* Background image with fallback */}
      <div className="absolute inset-0">
        {/* Fallback background gradient if image fails */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-purple-900/30" />

        {/* Background image (optional - will fallback to gradient if not found) */}
        <div className="relative w-full h-full">
          <Image
            src="/images/404-hero.png"
            alt="Thunder typing 404 background"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
        </div>

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
        {/* 404 Number */}
        <div className="mb-8 relative">
          <h1
            className="text-8xl sm:text-9xl lg:text-[8rem] font-black opacity-20 text-white select-none"
            aria-hidden="true"
          >
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl sm:text-5xl">⚡</div>
          </div>
        </div>

        {/* Main heading */}
        <h2
          id="notfound-heading"
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-6 leading-tight"
          style={{
            background:
              "linear-gradient(135deg, #22d3ee 0%, #60a5fa 50%, #a855f7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Oops! Page Not Found
        </h2>

        {/* Description */}
        <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
          The page you're looking for seems to have vanished into the digital
          void. Don't worry though – your typing skills are still lightning
          fast!
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          {/* <Link
            href="/"
            prefetch={false}
            className="group inline-flex items-center justify-center px-8 py-4 rounded-2xl font-semibold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-xl transform transition-all duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/40 active:scale-95"
          >
            <span className="mr-2">🏠</span>
            Go Home
            <div className="ml-2 transform transition-transform group-hover:translate-x-1">
              →
            </div>
          </Link> */}

          <Link
            href="/"
            prefetch={false}
            className="group inline-flex items-center justify-center px-8 py-4 rounded-2xl font-semibold text-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white shadow-xl transform transition-all duration-200 hover:scale-105 hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/40 active:scale-95"
          >
            <span className="mr-2">⚡</span>
            Start Typing
            <div className="ml-2 transform transition-transform group-hover:translate-x-1">
              →
            </div>
          </Link>
        </div>

        {/* Additional help links */}
        {/* <div className="text-center">
          <p className="text-sm text-gray-400 mb-4">
            Need help? Try these popular pages:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/lessons"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors"
            >
              Lessons
            </Link>
            <Link
              href="/leaderboard"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/about"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div> */}
      </div>

      {/* Floating elements for visual interest */}
      <div
        className="absolute top-20 left-10 text-6xl opacity-30 animate-bounce"
        style={{ animationDelay: "0s" }}
      >
        ⚡
      </div>
      <div
        className="absolute top-40 right-20 text-4xl opacity-20 animate-bounce"
        style={{ animationDelay: "1s" }}
      >
        💻
      </div>
      <div
        className="absolute bottom-20 left-20 text-5xl opacity-25 animate-bounce"
        style={{ animationDelay: "2s" }}
      >
        ⌨️
      </div>
      <div
        className="absolute bottom-40 right-10 text-3xl opacity-30 animate-bounce"
        style={{ animationDelay: "0.5s" }}
      >
        🚀
      </div>
    </main>
  );
}
