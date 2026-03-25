"use client";

import { useState, useCallback } from "react";
import {
  initLottery,
  enterLottery,
  pickWinner,
  getPlayers,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v6" />
      <path d="m15.5 5.5 4-4" />
      <path d="m8.5 8.5-4 4" />
      <path d="M12 21v-6" />
      <path d="m8.5 15.5 4-4" />
      <path d="m15.5 18.5-4-4" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

type Tab = "enter" | "players" | "draw";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("enter");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  
  const [isEntering, setIsEntering] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleEnter = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    setError(null);
    setIsEntering(true);
    setTxStatus("Entering lottery...");
    try {
      await enterLottery(walletAddress, walletAddress);
      setTxStatus("You have entered the lottery!");
      setTimeout(() => setTxStatus(null), 5000);
      // Refresh players list
      handleRefreshPlayers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsEntering(false);
    }
  }, [walletAddress]);

  const handlePickWinner = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    setError(null);
    setIsDrawing(true);
    setTxStatus("Picking winner...");
    setWinner(null);
    try {
      const result = await pickWinner(walletAddress);
      // Extract winner address from result - handle different response formats
      const resultAny = result as any;
      if (resultAny && typeof resultAny === 'object') {
        // Try to find the winner address in the response
        if (Array.isArray(resultAny)) {
          const winnerAddr = resultAny[0]?.value || resultAny[0];
          if (winnerAddr) {
            setWinner(winnerAddr);
            setTxStatus("Winner picked! 🎉");
            setTimeout(() => setTxStatus(null), 8000);
          }
        } else if (resultAny.returnValue) {
          const winnerAddr = resultAny.returnValue?.value?.[0]?.value || resultAny.returnValue;
          if (winnerAddr) {
            setWinner(winnerAddr);
            setTxStatus("Winner picked! 🎉");
            setTimeout(() => setTxStatus(null), 8000);
          }
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to pick winner");
      setTxStatus(null);
    } finally {
      setIsDrawing(false);
    }
  }, [walletAddress]);

  const handleRefreshPlayers = useCallback(async () => {
    setError(null);
    setIsLoadingPlayers(true);
    try {
      const result = await getPlayers(walletAddress || undefined);
      if (result && Array.isArray(result)) {
        setPlayers(result.map((p: any) => p.value || p));
      } else {
        setPlayers([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load players");
      setPlayers([]);
    } finally {
      setIsLoadingPlayers(false);
    }
  }, [walletAddress]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "enter", label: "Enter", icon: <TicketIcon />, color: "#7c6cf0" },
    { key: "players", label: "Players", icon: <UsersIcon />, color: "#4fc3f7" },
    { key: "draw", label: "Draw", icon: <TrophyIcon />, color: "#fbbf24" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("Winner") || txStatus.includes("entered") ? <SparkleIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#fbbf24]/20 to-[#7c6cf0]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#fbbf24]">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Decentralized Lottery</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="warning" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { 
                  setActiveTab(t.key); 
                  setError(null); 
                  if (t.key === "players") handleRefreshPlayers();
                }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Enter Lottery */}
            {activeTab === "enter" && (
              <div className="space-y-5">
                <MethodSignature name="enter" params="(player: Address)" color="#7c6cf0" />
                
                <div className="rounded-xl border border-[#7c6cf0]/15 bg-[#7c6cf0]/[0.03] p-5 text-center">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#7c6cf0]/20">
                    <TicketIcon />
                  </div>
                  <h4 className="text-lg font-semibold text-white/90">Join the Lottery</h4>
                  <p className="mt-1 text-sm text-white/40">Enter your wallet address for a chance to win!</p>
                </div>

                {walletAddress ? (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Your Address</span>
                      <p className="mt-1 font-mono text-sm text-white/70">{truncate(walletAddress)}</p>
                    </div>
                    <ShimmerButton onClick={handleEnter} disabled={isEntering} shimmerColor="#7c6cf0" className="w-full">
                      {isEntering ? <><SpinnerIcon /> Entering...</> : <><TicketIcon /> Enter Lottery</>}
                    </ShimmerButton>
                  </div>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to enter
                  </button>
                )}
              </div>
            )}

            {/* Players */}
            {activeTab === "players" && (
              <div className="space-y-5">
                <MethodSignature name="get_players" params="() -> Vec<Address>" color="#4fc3f7" returns="-> Vec<Address>" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Total Players</span>
                  <Badge variant="info">{players.length}</Badge>
                </div>

                {isLoadingPlayers ? (
                  <div className="flex items-center justify-center py-8">
                    <SpinnerIcon />
                    <span className="ml-2 text-white/40">Loading players...</span>
                  </div>
                ) : players.length > 0 ? (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      {players.map((player, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between border-b border-white/[0.04] px-4 py-3 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4fc3f7]/20 text-[10px] font-medium text-[#4fc3f7]">
                              {index + 1}
                            </div>
                            <span className="font-mono text-sm text-white/70">{truncate(player)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
                    <UsersIcon />
                    <p className="mt-2 text-sm text-white/40">No players yet. Be the first to enter!</p>
                  </div>
                )}

                <ShimmerButton onClick={handleRefreshPlayers} shimmerColor="#4fc3f7" className="w-full">
                  <RefreshIcon /> Refresh
                </ShimmerButton>
              </div>
            )}

            {/* Draw Winner */}
            {activeTab === "draw" && (
              <div className="space-y-5">
                <MethodSignature name="pick_winner" params="() -> Address" color="#fbbf24" returns="-> Address" />
                
                {winner && (
                  <div className="rounded-xl border border-[#fbbf24]/20 bg-[#fbbf24]/[0.05] p-6 text-center animate-fade-in-up">
                    <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#fbbf24]/20">
                      <TrophyIcon />
                    </div>
                    <h4 className="text-lg font-semibold text-[#fbbf24]">We Have a Winner!</h4>
                    <p className="mt-2 font-mono text-sm text-white/70 break-all">{winner}</p>
                  </div>
                )}

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex items-center gap-3 text-sm text-white/50">
                    <AlertIcon />
                    <span>Drawing a winner will reset the lottery for the next round.</span>
                  </div>
                </div>

                {walletAddress ? (
                  <ShimmerButton onClick={handlePickWinner} disabled={isDrawing} shimmerColor="#fbbf24" className="w-full">
                    {isDrawing ? <><SpinnerIcon /> Drawing...</> : <><TrophyIcon /> Pick Winner</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#fbbf24]/20 bg-[#fbbf24]/[0.03] py-4 text-sm text-[#fbbf24]/60 hover:border-[#fbbf24]/30 hover:text-[#fbbf24]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to draw winner
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Decentralized Lottery &middot; Soroban</p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#7c6cf0]" />
                <span className="font-mono text-[9px] text-white/15">Permissionless</span>
              </span>
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}