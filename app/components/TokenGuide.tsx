"use client";

import { useRef, type ReactNode } from "react";
import { ExternalLinkIcon, HelpCircleIcon, InfoIcon, LockIcon, XIcon } from "./icons";
import { Button } from "./ui";

const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-800 font-mono text-[11px] text-zinc-200">
    {children}
  </kbd>
);

const Code = ({ children }: { children: ReactNode }) => (
  <code className="px-1 py-0.5 rounded bg-zinc-800 font-mono text-xs text-zinc-200">
    {children}
  </code>
);

const steps: { title: string; body: ReactNode }[] = [
  {
    title: "Log in to Stockbit",
    body: (
      <>
        Open{" "}
        <a
          href="https://stockbit.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline underline-offset-2"
        >
          stockbit.com
          <ExternalLinkIcon className="w-3 h-3" />
        </a>{" "}
        in a new tab and sign in to your account.
      </>
    ),
  },
  {
    title: "Open DevTools",
    body: (
      <>
        Press <Kbd>F12</Kbd>, or <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>I</Kbd> on
        Windows/Linux, <Kbd>Cmd</Kbd> + <Kbd>Option</Kbd> + <Kbd>I</Kbd> on macOS.
      </>
    ),
  },
  {
    title: "Go to Local Storage",
    body: (
      <>
        Open the <strong className="text-zinc-200">Application</strong> tab (
        <strong className="text-zinc-200">Storage</strong> in Firefox), expand{" "}
        <strong className="text-zinc-200">Local Storage</strong> and select{" "}
        <Code>https://stockbit.com</Code>.
      </>
    ),
  },
  {
    title: "Find the auth entry",
    body: (
      <>
        Click the <Code>persist:root</Code> key. Its value is JSON; look for the{" "}
        <Code>auth</Code> field inside it.
      </>
    ),
  },
  {
    title: "Copy the access token",
    body: (
      <>
        Inside <Code>auth</Code>, copy the access token value: a long string that
        usually starts with <Code>eyJ</Code>. Leave out the surrounding quotes.
      </>
    ),
  },
  {
    title: "Paste it here",
    body: <>Paste the token into the Access token field. The features unlock right away.</>,
  },
];

export default function TokenGuide() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <HelpCircleIcon className="w-4 h-4" />
        Guide
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="token-guide-title"
        // Clicks on the backdrop land on the <dialog> itself, not its content.
        onClick={(e) => e.target === dialogRef.current && close()}
        className="custom-scrollbar m-auto w-[calc(100%-2rem)] max-w-lg max-h-[calc(100dvh-2rem)] p-0 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <div>
            <h2 id="token-guide-title" className="text-base font-semibold">
              Get your access token
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Takes about a minute in a desktop browser.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close guide"
            className="grid place-items-center w-8 h-8 -mr-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <XIcon />
          </button>
        </div>

        <ol className="px-5 py-5 space-y-4">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="grid place-items-center w-6 h-6 shrink-0 rounded-full bg-blue-500/15 text-xs font-semibold text-blue-300 tabular-nums">
                {i + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mx-5 space-y-2">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs leading-relaxed text-emerald-200">
            <LockIcon className="w-4 h-4 mt-px shrink-0" />
            <p>
              <strong className="font-semibold">Your token is not saved.</strong> It lives
              only in this browser tab&apos;s memory and is sent only to Stockbit to fetch
              your data. Nothing is written to storage, cookies or a database, so it&apos;s
              gone as soon as you reload or close the tab.
            </p>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs leading-relaxed text-amber-200">
            <InfoIcon className="w-4 h-4 mt-px shrink-0" />
            <p>
              Treat the token like a password and don&apos;t share it. Tokens expire; if
              requests start failing, repeat these steps.
            </p>
          </div>
        </div>

        <div className="flex justify-end px-5 py-4">
          <Button onClick={close}>Got it</Button>
        </div>
      </dialog>
    </>
  );
}
