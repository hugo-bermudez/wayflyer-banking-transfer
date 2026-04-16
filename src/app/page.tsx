"use client";

import { useState } from "react";
import Image from "next/image";
import {
  NavArrowDown,
  Xmark,
  ArrowDown,
} from "iconoir-react";

interface Account {
  name: string;
  lastFour: string;
  balance: string;
  currency: string;
  avatarColor: string;
}

const ACCOUNTS: Account[] = [
  {
    name: "Marketing Budget",
    lastFour: "8323",
    balance: "$125,085.50",
    currency: "USD",
    avatarColor: "#f7edf7",
  },
  {
    name: "Operational Expenses",
    lastFour: "5295",
    balance: "$74,500.00",
    currency: "USD",
    avatarColor: "#e5f2ff",
  },
];

function AccountAvatar({ color }: { color: string }) {
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: 40,
        height: 40,
        borderRadius: 1000,
        background: color,
      }}
    >
      <Image
        src="/icons/logo-w.svg"
        alt=""
        width={20}
        height={15}
        className="shrink-0"
      />
    </div>
  );
}

function BankIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M2 20H22"
        stroke="#676765"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 20V12"
        stroke="#676765"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 20V12"
        stroke="#676765"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 20V12"
        stroke="#676765"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 20V12"
        stroke="#676765"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 3L2 9H22L12 3Z"
        stroke="#676765"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type PresetKey = "filled" | "half" | "empty";

const PRESETS: Record<
  PresetKey,
  {
    rawDigits: string;
    topAccount: Account | null;
    bottomAccount: Account | null;
    topLabel: string;
    bottomLabel: string;
    scheduled: string | null;
    rotation: number;
  }
> = {
  empty: {
    rawDigits: "",
    topAccount: null,
    bottomAccount: null,
    topLabel: "From",
    bottomLabel: "To",
    scheduled: null,
    rotation: 0,
  },
  half: {
    rawDigits: "50000",
    topAccount: null,
    bottomAccount: ACCOUNTS[0],
    topLabel: "From",
    bottomLabel: "To",
    scheduled: null,
    rotation: 0,
  },
  filled: {
    rawDigits: "1145000",
    topAccount: ACCOUNTS[0],
    bottomAccount: ACCOUNTS[1],
    topLabel: "From",
    bottomLabel: "To",
    scheduled: "On Thursday 16 April 2026",
    rotation: 0,
  },
};

export default function TransferPage() {
  const [activePreset, setActivePreset] = useState<PresetKey>("filled");
  const [topAccount, setTopAccount] = useState<Account | null>(ACCOUNTS[0]);
  const [bottomAccount, setBottomAccount] = useState<Account | null>(ACCOUNTS[1]);
  const [topLabel, setTopLabel] = useState("From");
  const [bottomLabel, setBottomLabel] = useState("To");
  const [scheduledDate, setScheduledDate] = useState<string | null>(
    "On Thursday 16 April 2026"
  );
  const [swapRotation, setSwapRotation] = useState(0);
  const [swapPhase, setSwapPhase] = useState<"idle" | "out" | "in">("idle");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Store raw digits only (no formatting). Display is derived.
  const [rawDigits, setRawDigits] = useState("1145000");

  const applyPreset = (key: PresetKey) => {
    const p = PRESETS[key];
    const shouldAnimate = key !== "filled";
    const accountsChanging = topAccount !== p.topAccount || bottomAccount !== p.bottomAccount;

    if (shouldAnimate && accountsChanging) {
      setAnimationsEnabled(true);
      setSwapPhase("out");
      setTimeout(() => {
        setRawDigits(p.rawDigits);
        setTopAccount(p.topAccount);
        setBottomAccount(p.bottomAccount);
        setTopLabel(p.topLabel);
        setBottomLabel(p.bottomLabel);
        setScheduledDate(p.scheduled);
        setSwapRotation(p.rotation);
        setSwapPhase("in");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setSwapPhase("idle");
          });
        });
      }, 200);
    } else {
      setAnimationsEnabled(false);
      setSwapPhase("idle");
      setRawDigits(p.rawDigits);
      setTopAccount(p.topAccount);
      setBottomAccount(p.bottomAccount);
      setTopLabel(p.topLabel);
      setBottomLabel(p.bottomLabel);
      setScheduledDate(p.scheduled);
      setSwapRotation(p.rotation);
    }
    setActivePreset(key);
  };

  const formatCurrency = (digits: string): string => {
    if (digits === "") return "";
    if (digits.length === 1) return digits;
    if (digits.length === 2) return digits;

    const intPart = digits.slice(0, -2).replace(/^0+/, "") || "0";
    const decPart = digits.slice(-2);

    const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formatted}.${decPart}`;
  };

  const amount = formatCurrency(rawDigits);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, "");
    setRawDigits(digits);
  };

  const handleSwap = () => {
    if (swapPhase !== "idle") return;

    if (activePreset === "filled") {
      // Filled: only animate the arrow, nothing else changes
      setSwapRotation((prev) => prev + 180);
      return;
    }

    if (activePreset === "empty") {
      // Empty: swap labels only, animate selects
      setAnimationsEnabled(true);
      setSwapPhase("out");
      setSwapRotation((prev) => prev + 180);
      setTimeout(() => {
        const tempLabel = topLabel;
        setTopLabel(bottomLabel);
        setBottomLabel(tempLabel);
        setSwapPhase("in");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setSwapPhase("idle");
          });
        });
      }, 200);
      return;
    }

    // Half and default: full swap with animation
    setAnimationsEnabled(true);
    setSwapPhase("out");
    setSwapRotation((prev) => prev + 180);
    setTimeout(() => {
      const tempAcc = topAccount;
      setTopAccount(bottomAccount);
      setBottomAccount(tempAcc);
      const tempLabel = topLabel;
      setTopLabel(bottomLabel);
      setBottomLabel(tempLabel);
      setSwapPhase("in");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSwapPhase("idle");
        });
      });
    }, 200);
  };


  return (
    <div
      className="flex flex-col items-center justify-center h-full"
      style={{ background: "var(--nav-background)" }}
    >
      {/* Card container */}
      <div
        className="flex flex-col flex-1 w-full"
        style={{
          background: "var(--surface-level-3)",
          border: "var(--border-sm) solid var(--border-default)",
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <header
          className="flex items-center justify-between shrink-0"
          style={{ padding: "var(--space-150)" }}
        >
          <Image
            src="/icons/logo-w.svg"
            alt="Wayflyer"
            width={33}
            height={24}
            priority
          />
          <button
            className="flex items-center justify-center shrink-0 cursor-pointer"
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-rounded)",
              border: "var(--border-md) solid var(--border-input)",
              background: "transparent",
            }}
            aria-label="Close"
          >
            <Xmark width={16} height={16} strokeWidth={1.5} color="#0D0D0D" />
          </button>
        </header>

        {/* Body */}
        <main
          className="flex flex-col items-center justify-center flex-1"
          style={{
            borderTop: "var(--border-sm) solid var(--border-default)",
            borderBottom: "var(--border-sm) solid var(--border-default)",
            paddingTop: "var(--space-250)",
            paddingBottom: "var(--space-500)",
            paddingLeft: "var(--space-250)",
            paddingRight: "var(--space-250)",
            gap: "var(--space-250)",
          }}
        >
          {/* Title section */}
          <div
            className="flex flex-col w-full"
            style={{ maxWidth: 526, gap: "var(--space-100)" }}
          >
            <h1
              className="font-medium"
              style={{
                fontSize: "var(--font-size-2xl)",
                color: "var(--text-primary)",
                letterSpacing: "var(--letter-spacing-compact)",
                lineHeight: 1,
              }}
            >
              Transfer
            </h1>
            <p
              style={{
                fontSize: "var(--font-size-md)",
                color: "var(--text-secondary)",
                lineHeight: 1,
              }}
            >
              Enter the transfer details.
            </p>
          </div>

          {/* Form */}
          <div
            className="flex flex-col items-center w-full"
            style={{ maxWidth: 526, gap: "var(--space-150)" }}
          >
            {/* Amount input */}
            <div
              className="input-border flex items-center w-full"
              style={{
                height: 80,
                borderRadius: "var(--radius-100)",
                border: "var(--border-md) solid var(--border-input)",
                padding: "var(--space-150)",
                gap: "var(--space-25)",
              }}
            >
              <span
                className="font-medium shrink-0"
                style={{
                  fontSize: "var(--font-size-3xl)",
                  color: "var(--text-secondary)",
                  letterSpacing: "var(--letter-spacing-compact)",
                  lineHeight: 1,
                }}
              >
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="flex-1 min-w-0 font-medium bg-transparent outline-none placeholder:text-[var(--text-secondary)]"
                style={{
                  fontSize: "var(--font-size-3xl)",
                  color: "var(--text-primary)",
                  letterSpacing: "var(--letter-spacing-compact)",
                  lineHeight: 1,
                }}
                aria-label="Transfer amount"
              />
              <button
                className="flex items-center shrink-0 cursor-pointer"
                style={{
                  height: 40,
                  borderRadius: "var(--radius-rounded)",
                  border: "var(--border-md) solid var(--border-input)",
                  paddingLeft: "var(--space-75)",
                  paddingRight: "var(--space-75)",
                  gap: "var(--space-25)",
                  boxShadow: "var(--shadow-button)",
                  background: "transparent",
                }}
              >
                <Image
                  src="/icons/flag-us.svg"
                  alt="US flag"
                  width={20}
                  height={12}
                  className="shrink-0"
                />
                <span
                  className="font-medium"
                  style={{
                    fontSize: "var(--font-size-md)",
                    color: "var(--text-primary)",
                    paddingLeft: "var(--space-25)",
                    paddingRight: "var(--space-25)",
                    lineHeight: 1,
                  }}
                >
                  USD
                </span>
              </button>
            </div>

            {/* From / To selectors */}
            <div
              className="relative flex flex-col items-center w-full"
              style={{ gap: "var(--space-125)" }}
            >
              {/* Top selector */}
              <button
                className="account-select flex items-center w-full cursor-pointer bg-transparent"
                style={{
                  height: 80,
                  borderRadius: "var(--radius-100)",
                  border: "var(--border-md) solid var(--border-input)",
                  padding: "var(--space-100)",
                  gap: "var(--space-100)",
                }}
              >
                <div className={`account-content flex items-center flex-1 min-w-0${!animationsEnabled ? " no-transition" : swapPhase === "out" ? " swap-out" : swapPhase === "in" ? " swap-in" : ""}`} style={{ gap: "var(--space-100)" }}>
                  {topAccount ? (
                    <AccountAvatar color={topAccount.avatarColor} />
                  ) : (
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "var(--radius-rounded)",
                      }}
                    >
                      <BankIcon />
                    </div>
                  )}
                  <div
                    className="flex flex-col flex-1 min-w-0 items-start justify-center"
                    style={{ gap: "var(--space-50)" }}
                  >
                    <span
                      className="font-medium"
                      style={{
                        fontSize: "var(--font-size-md)",
                        color: "var(--text-primary)",
                        lineHeight: 1,
                      }}
                    >
                      {topAccount
                        ? `${topAccount.name} ··${topAccount.lastFour}`
                        : topLabel}
                    </span>
                    {topAccount && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          lineHeight: 1,
                        }}
                      >
                        {topAccount.balance} · {topAccount.currency}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "var(--radius-rounded)",
                  }}
                >
                  <NavArrowDown
                    width={16}
                    height={16}
                    strokeWidth={1.5}
                    color="#0D0D0D"
                  />
                </div>
              </button>

              {/* Bottom selector */}
              <button
                className="account-select flex items-center w-full cursor-pointer bg-transparent"
                style={{
                  height: 80,
                  borderRadius: "var(--radius-100)",
                  border: "var(--border-md) solid var(--border-input)",
                  padding: "var(--space-100)",
                  gap: "var(--space-100)",
                }}
              >
                <div className={`account-content account-content-second flex items-center flex-1 min-w-0${!animationsEnabled ? " no-transition" : swapPhase === "out" ? " swap-out" : swapPhase === "in" ? " swap-in" : ""}`} style={{ gap: "var(--space-100)" }}>
                  {bottomAccount ? (
                    <AccountAvatar color={bottomAccount.avatarColor} />
                  ) : (
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "var(--radius-rounded)",
                      }}
                    >
                      <BankIcon />
                    </div>
                  )}
                  <div
                    className="flex flex-col flex-1 min-w-0 items-start justify-center"
                    style={{ gap: "var(--space-50)" }}
                  >
                    <span
                      className="font-medium"
                      style={{
                        fontSize: "var(--font-size-md)",
                        color: "var(--text-primary)",
                        lineHeight: 1,
                      }}
                    >
                      {bottomAccount
                        ? `${bottomAccount.name} ··${bottomAccount.lastFour}`
                        : bottomLabel}
                    </span>
                    {bottomAccount && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          lineHeight: 1,
                        }}
                      >
                        {bottomAccount.balance} · {bottomAccount.currency}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "var(--radius-rounded)",
                  }}
                >
                  <NavArrowDown
                    width={16}
                    height={16}
                    strokeWidth={1.5}
                    color="#0D0D0D"
                  />
                </div>
              </button>

              {/* Swap button - centered between From and To */}
              <button
                onClick={handleSwap}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer"
                style={{
                  width: "var(--space-250)",
                  height: "var(--space-250)",
                  borderRadius: "var(--radius-rounded)",
                  border: "var(--border-md) solid var(--border-input)",
                  background: "var(--surface-level-2)",
                  boxShadow: "var(--shadow-button)",
                }}
                aria-label="Swap accounts"
              >
                <ArrowDown
                  width={24}
                  height={24}
                  strokeWidth={1.5}
                  color="#0D0D0D"
                  className="swap-icon"
                  style={{
                    transform: `rotate(${swapRotation}deg)`,
                    transition: "transform 160ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </button>
            </div>

            {/* Schedule transfer */}
            {scheduledDate ? (
              <button
                className="flex items-center justify-center cursor-pointer shrink-0"
                style={{
                  height: 32,
                  borderRadius: "var(--radius-rounded)",
                  border: "var(--border-md) solid var(--border-input)",
                  paddingLeft: "var(--space-50)",
                  paddingRight: "var(--space-50)",
                  gap: 2,
                  boxShadow: "var(--shadow-button)",
                  background: "transparent",
                }}
                onClick={() => setScheduledDate(null)}
              >
                <span
                  className="font-medium whitespace-nowrap"
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-primary)",
                    paddingLeft: "var(--space-25)",
                    paddingRight: "var(--space-25)",
                    lineHeight: 1,
                  }}
                >
                  {scheduledDate}
                </span>
                <Xmark
                  width={16}
                  height={16}
                  strokeWidth={1.5}
                  color="#0D0D0D"
                />
              </button>
            ) : (
              <button
                className="flex items-center justify-center cursor-pointer shrink-0"
                style={{
                  height: 32,
                  borderRadius: "var(--radius-rounded)",
                  border: "var(--border-md) solid var(--border-input)",
                  paddingLeft: "var(--space-50)",
                  paddingRight: "var(--space-50)",
                  gap: 2,
                  boxShadow: "var(--shadow-button)",
                  background: "transparent",
                }}
                onClick={() =>
                  setScheduledDate("On Thursday 16 April 2026")
                }
              >
                <span
                  className="font-medium whitespace-nowrap"
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-primary)",
                    paddingLeft: "var(--space-25)",
                    paddingRight: "var(--space-25)",
                    lineHeight: 1,
                  }}
                >
                  Schedule transfer
                </span>
              </button>
            )}
          </div>

          {/* Actions */}
          <div
            className="flex items-center justify-end w-full"
            style={{ maxWidth: 526, gap: "var(--space-100)" }}
          >
            <button
              className="flex flex-1 items-center justify-center cursor-pointer"
              style={{
                height: 40,
                borderRadius: "var(--radius-rounded)",
                background: "var(--accent-background)",
                paddingLeft: "var(--space-75)",
                paddingRight: "var(--space-75)",
                boxShadow: "var(--shadow-accent-button)",
                border: "none",
              }}
            >
              <span
                className="font-medium whitespace-nowrap"
                style={{
                  fontSize: "var(--font-size-md)",
                  color: "var(--text-inverse)",
                  paddingLeft: "var(--space-25)",
                  paddingRight: "var(--space-25)",
                  lineHeight: 1,
                }}
              >
                Review transfer
              </span>
            </button>
          </div>
        </main>
      </div>

      {/* Segmented control */}
      <div
        className="fixed bottom-[20px] left-[20px] flex items-start"
        style={{
          borderRadius: "var(--radius-rounded)",
          background: "var(--nav-background)",
          paddingRight: 1.5,
        }}
      >
        {(["empty", "half", "filled"] as const).map((key) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            className="cursor-pointer whitespace-nowrap font-medium"
            style={{
              height: 32,
              borderRadius: "var(--radius-rounded)",
              paddingLeft: "var(--space-50)",
              paddingRight: "var(--space-50)",
              fontSize: "var(--font-size-sm)",
              lineHeight: 1,
              marginRight: -1.5,
              background:
                activePreset === key ? "var(--surface-level-3)" : "transparent",
              border:
                activePreset === key
                  ? "var(--border-md) solid var(--border-input)"
                  : "var(--border-md) solid transparent",
              boxShadow:
                activePreset === key ? "var(--shadow-button)" : "none",
              color:
                activePreset === key
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              transition:
                "background 160ms cubic-bezier(0.4,0,0.2,1), color 160ms cubic-bezier(0.4,0,0.2,1), border-color 160ms cubic-bezier(0.4,0,0.2,1), box-shadow 160ms cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {key === "filled" ? "Filled" : key === "half" ? "Half" : "Empty"}
          </button>
        ))}
      </div>
    </div>
  );
}
