"use client";

import { Notifications, HelpOutline, Search } from "@mui/icons-material";

export function TopNavBar() {
  return (
    <header className="fixed top-0 right-0 left-64 h-16 z-40 flex items-center justify-between px-8 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant/15">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-on-surface-variant">
          Generación de mazo activo
        </span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative group hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg w-5 h-5" />
          <input
            className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-outline"
            placeholder="Search your library..."
            type="text"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-on-surface-variant hover:text-primary transition-all rounded-full hover:bg-surface-container-low">
            <Notifications className="w-5 h-5" />
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-all rounded-full hover:bg-surface-container-low">
            <HelpOutline className="w-5 h-5" />
          </button>

          {/* Avatar */}
          <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-white shadow-sm ml-2 bg-primary-container">
            <svg
              className="w-full h-full text-on-primary-container"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
