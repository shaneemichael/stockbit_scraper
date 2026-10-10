"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ChevronDownIcon, LockIcon, UnlockIcon } from "./icons";
import TokenGuide from "./TokenGuide";
import { inputClass } from "./ui";

export default function TokenInput() {
  const { accessToken, setAccessToken, isAuthenticated } = useAuth();
  const [expanded, setExpanded] = useState(!isAuthenticated);

  return (
    <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-xl">
      <div className="flex items-center gap-1 pr-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls="token-panel"
          className="flex-1 min-w-0 px-4 h-12 flex items-center justify-between gap-2 text-left cursor-pointer"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            {isAuthenticated ? (
              <UnlockIcon className="w-4 h-4 text-emerald-400" />
            ) : (
              <LockIcon className="w-4 h-4 text-amber-400" />
            )}
            {isAuthenticated ? "Authenticated" : "Access token required"}
          </span>
          <ChevronDownIcon
            className={`w-4 h-4 text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        <span className="w-px h-5 bg-zinc-800" aria-hidden="true" />
        <TokenGuide />
      </div>

      {expanded && (
        <div id="token-panel" className="px-4 pb-4 pt-3 border-t border-zinc-800 space-y-2">
          <label htmlFor="access-token" className="block text-xs font-medium text-zinc-400">
            Access token
          </label>
          <input
            id="access-token"
            type="text"
            spellCheck={false}
            autoComplete="off"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Paste your access token"
            className={`${inputClass} w-full font-mono`}
          />
          <p className="text-xs text-zinc-500">
            Your token isn&apos;t saved: it stays in this tab&apos;s memory and is cleared
            on reload. Not sure where to find it? Open the Guide above.
          </p>
        </div>
      )}
    </div>
  );
}
