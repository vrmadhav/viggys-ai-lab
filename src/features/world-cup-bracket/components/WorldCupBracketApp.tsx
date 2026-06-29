"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { RefreshCcw, RotateCcw } from "lucide-react";
import {
  emptyPicks,
  fallbackBracket,
  type BracketMatch,
  type BracketPayload,
  type BracketStatus,
  type BracketTeam,
  type PickState,
} from "@/features/world-cup-bracket/data/bracket";

const CW = 130;
const CH = 56;
const ROW = 80;
const GAP = 16;
const CONN = 24;
const TOP_RESERVED = 72;
const BOT_RESERVED = 72;
const BRACKET_FETCH_TIMEOUT_MS = 9000;
const STEP = CW + GAP + CONN + GAP;
const leftX = [0, STEP, 2 * STEP, 3 * STEP];
const CHAMP_BOX_W = 160;
const CENTER_GAP = CHAMP_BOX_W + 40;
const sfLX = leftX[3];
const sfRXOffset = sfLX + CW + GAP + CONN + CENTER_GAP + CONN + GAP;
const rightX = [sfRXOffset + 3 * STEP, sfRXOffset + 2 * STEP, sfRXOffset + STEP, sfRXOffset];
const TOTAL_W = rightX[0] + CW;
const TOTAL_H = TOP_RESERVED + 8 * ROW + BOT_RESERVED;

type RoundKey = "r32" | "r16" | "qf" | "sf";

function slotH(round: number) {
  return ROW * Math.pow(2, round);
}

function cardTop(round: number, slot: number) {
  return TOP_RESERVED + slot * slotH(round) + (slotH(round) - CH) / 2;
}

function cardMidY(round: number, slot: number) {
  return cardTop(round, slot) + CH / 2;
}

function clonePicks(picks: PickState): PickState {
  return {
    r32: [...picks.r32],
    r16: [...picks.r16],
    qf: [...picks.qf],
    sf: [...picks.sf],
    f: picks.f,
    third: picks.third,
  };
}

function invalidate(picks: PickState, round: RoundKey, index: number) {
  if (round === "r32") {
    const r16Index = Math.floor(index / 2);
    picks.r16[r16Index] = null;
    invalidate(picks, "r16", r16Index);
    return;
  }

  if (round === "r16") {
    const qfIndex = Math.floor(index / 2);
    picks.qf[qfIndex] = null;
    invalidate(picks, "qf", qfIndex);
    return;
  }

  if (round === "qf") {
    const sfIndex = Math.floor(index / 2);
    picks.sf[sfIndex] = null;
    invalidate(picks, "sf", sfIndex);
    return;
  }

  picks.f = null;
  picks.third = null;
}

function isLocked(status: BracketStatus) {
  return status === "done" || status === "live";
}

function formatUpdatedAt(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not synced yet";

  const parts = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
    timeZoneName: "short",
  }).formatToParts(parsed);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("month")} ${getPart("day")}, ${getPart("hour")}:${getPart("minute")} ${getPart("dayPeriod")} ${getPart("timeZoneName")}`;
}

function scoreParts(score: string | null): [string | null, string | null] {
  if (!score) return [null, null];
  const [a, b] = score.split("-");
  return [a ?? null, b ?? null];
}

function statusChip(status: BracketStatus, detail?: string) {
  if (status === "done") return { className: "wc-chip-done", label: detail || "FT" };
  if (status === "live") return { className: "wc-chip-live", label: detail || "Live" };
  if (status === "today") return { className: "wc-chip-today", label: "Today" };
  return null;
}

async function fetchBracketPayload() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), BRACKET_FETCH_TIMEOUT_MS);

  const response = await fetch(`/api/world-cup-bracket?t=${Date.now()}`, {
    cache: "no-store",
    signal: controller.signal,
  }).finally(() => window.clearTimeout(timeoutId));

  if (!response.ok) {
    throw new Error(`Refresh failed (${response.status})`);
  }

  return (await response.json()) as BracketPayload & { error?: string };
}

function Line({
  x1,
  y1,
  x2,
  y2,
  color = "#3b5bdb",
  sw = 1.5,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  sw?: number;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeLinecap="round"
      strokeWidth={sw}
    />
  );
}

function connectorLines(round: number, side: "left" | "right", xCard: number, n: number) {
  const lines: ReactNode[] = [];

  for (let pair = 0; pair < n / 2; pair += 1) {
    const yA = cardMidY(round, pair * 2);
    const yB = cardMidY(round, pair * 2 + 1);
    const yMid = (yA + yB) / 2;

    if (side === "right") {
      const x0 = xCard + CW;
      const xV = x0 + GAP + CONN / 2;
      const x1 = x0 + GAP + CONN;
      lines.push(
        <Line key={`${round}-${side}-${pair}-a`} x1={x0} y1={yA} x2={xV} y2={yA} />,
        <Line key={`${round}-${side}-${pair}-b`} x1={x0} y1={yB} x2={xV} y2={yB} />,
        <Line key={`${round}-${side}-${pair}-c`} x1={xV} y1={yA} x2={xV} y2={yB} />,
        <Line key={`${round}-${side}-${pair}-d`} x1={xV} y1={yMid} x2={x1} y2={yMid} />,
      );
    } else {
      const x0 = xCard;
      const xV = x0 - GAP - CONN / 2;
      const x1 = x0 - GAP - CONN;
      lines.push(
        <Line key={`${round}-${side}-${pair}-a`} x1={x0} y1={yA} x2={xV} y2={yA} />,
        <Line key={`${round}-${side}-${pair}-b`} x1={x0} y1={yB} x2={xV} y2={yB} />,
        <Line key={`${round}-${side}-${pair}-c`} x1={xV} y1={yA} x2={xV} y2={yB} />,
        <Line key={`${round}-${side}-${pair}-d`} x1={xV} y1={yMid} x2={x1} y2={yMid} />,
      );
    }
  }

  return lines;
}

function TeamRow({
  team,
  isWinner,
  isEliminated,
  locked,
  score,
  onPick,
}: {
  team: BracketTeam | null;
  isWinner: boolean;
  isEliminated: boolean;
  locked: boolean;
  score: string | null;
  onPick?: () => void;
}) {
  const disabled = !team || locked || !onPick;
  const handlePick = () => {
    if (!disabled) onPick?.();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      className={`wc-team${isWinner ? " win" : ""}${isEliminated ? " elim" : ""}${team ? "" : " tbd"}${locked ? " locked" : ""}`}
      onClick={handlePick}
    >
      <span className="wc-wd" />
      <span className="wc-flag">{team?.flag ?? ""}</span>
      <span className="wc-nm">{team?.name ?? "TBD"}</span>
      {score ? <span className="wc-sc">{score}</span> : null}
    </button>
  );
}

function MatchCard({
  x,
  y,
  match,
  teamA,
  teamB,
  winner,
  locked = false,
  onPickA,
  onPickB,
  extraClassName = "",
}: {
  x: number;
  y: number;
  match: Pick<BracketMatch, "loc" | "date" | "status" | "score" | "detail">;
  teamA: BracketTeam | null;
  teamB: BracketTeam | null;
  winner: number | null;
  locked?: boolean;
  onPickA?: () => void;
  onPickB?: () => void;
  extraClassName?: string;
}) {
  const chip = statusChip(match.status, match.detail);
  const [scoreA, scoreB] = scoreParts(match.score);
  const matchLocked = locked || isLocked(match.status);

  return (
    <>
      <div
        className={`wc-card${match.status === "today" || match.status === "live" ? " today" : ""} ${extraClassName}`}
        style={{ left: x, top: y, width: CW, height: CH }}
      >
        <TeamRow
          team={teamA}
          isWinner={winner === 0}
          isEliminated={winner === 1}
          locked={matchLocked}
          score={scoreA}
          onPick={onPickA}
        />
        <TeamRow
          team={teamB}
          isWinner={winner === 1}
          isEliminated={winner === 0}
          locked={matchLocked}
          score={scoreB}
          onPick={onPickB}
        />
      </div>
      {match.loc || match.date ? (
        <div className="wc-meta" style={{ left: x, top: y + CH + 4 }}>
          {chip ? <span className={chip.className}>{chip.label}</span> : null}
          {match.loc ? <span className="wc-mloc">{match.loc}</span> : null}
          {match.loc && match.date ? <span className="wc-msep">·</span> : null}
          {match.date ? <span className="wc-mdt">{match.date}</span> : null}
        </div>
      ) : null}
    </>
  );
}

export function WorldCupBracketApp() {
  const [bracket, setBracket] = useState<BracketPayload>(fallbackBracket);
  const [picks, setPicks] = useState<PickState>(() => emptyPicks());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const didInitialRefresh = useRef(false);

  const refreshBracket = useCallback(async () => {
    setIsRefreshing(true);
    setSyncError(null);

    try {
      const payload = await fetchBracketPayload();
      setBracket(payload);
      setSyncError(payload.error ?? null);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Refresh failed");
      setBracket(fallbackBracket);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (didInitialRefresh.current) return;
    didInitialRefresh.current = true;

    let isCancelled = false;

    async function loadInitialBracket() {
      try {
        const payload = await fetchBracketPayload();
        if (isCancelled) return;
        setBracket(payload);
        setSyncError(payload.error ?? null);
      } catch (error) {
        if (isCancelled) return;
        setSyncError(error instanceof Error ? error.message : "Refresh failed");
        setBracket(fallbackBracket);
      } finally {
        if (!isCancelled) setIsRefreshing(false);
      }
    }

    void loadInitialBracket();

    return () => {
      isCancelled = true;
    };
  }, []);

  const r32w = useCallback(
    (index: number) =>
      bracket.r32[index]?.status === "done" ? bracket.r32[index].winner : picks.r32[index],
    [bracket.r32, picks.r32],
  );

  const r16t = useCallback(
    (index: number, slot: number) => {
      const sourceTeam = bracket.r16[index]?.teams[slot] ?? null;
      if (sourceTeam) return sourceTeam;

      const r32Index = index * 2 + slot;
      const winner = r32w(r32Index);
      return winner === null ? null : bracket.r32[r32Index]?.teams[winner] ?? null;
    },
    [bracket.r16, bracket.r32, r32w],
  );

  const r16w = useCallback(
    (index: number) =>
      bracket.r16[index]?.status === "done" ? bracket.r16[index].winner : picks.r16[index],
    [bracket.r16, picks.r16],
  );

  const r16win = useCallback(
    (index: number) => {
      const winner = r16w(index);
      return winner === null ? null : r16t(index, winner);
    },
    [r16t, r16w],
  );

  const qft = useCallback(
    (index: number, slot: number) => {
      const sourceTeam = bracket.qf[index]?.teams[slot] ?? null;
      if (sourceTeam) return sourceTeam;

      return r16win(index * 2 + slot);
    },
    [bracket.qf, r16win],
  );

  const qfw = useCallback(
    (index: number) => (bracket.qf[index]?.status === "done" ? bracket.qf[index].winner : picks.qf[index]),
    [bracket.qf, picks.qf],
  );

  const qfwin = useCallback(
    (index: number) => {
      const winner = qfw(index);
      return winner === null ? null : qft(index, winner);
    },
    [qft, qfw],
  );

  const sft = useCallback(
    (index: number, slot: number) => {
      const sourceTeam = bracket.sf[index]?.teams[slot] ?? null;
      if (sourceTeam) return sourceTeam;

      return qfwin(index * 2 + slot);
    },
    [bracket.sf, qfwin],
  );

  const sfw = useCallback(
    (index: number) => (bracket.sf[index]?.status === "done" ? bracket.sf[index].winner : picks.sf[index]),
    [bracket.sf, picks.sf],
  );

  const sfwin = useCallback(
    (index: number) => {
      const winner = sfw(index);
      return winner === null ? null : sft(index, winner);
    },
    [sft, sfw],
  );

  const fint = useCallback(
    (slot: number) => bracket.final.teams[slot] ?? sfwin(slot),
    [bracket.final.teams, sfwin],
  );

  const finalWinner = bracket.final.status === "done" ? bracket.final.winner : picks.f;
  const champion = finalWinner === null ? null : fint(finalWinner);
  const sf0Loser = sfw(0) === null ? null : sft(0, 1 - Number(sfw(0)));
  const sf1Loser = sfw(1) === null ? null : sft(1, 1 - Number(sfw(1)));
  const thirdWinner = bracket.third.status === "done" ? bracket.third.winner : picks.third;

  const selectPick = useCallback((round: RoundKey, index: number, slot: number) => {
    setPicks((current) => {
      const next = clonePicks(current);
      const previous = next[round][index];
      next[round][index] = slot;
      if (previous !== slot) invalidate(next, round, index);
      return next;
    });
  }, []);

  const selectFinal = useCallback((slot: number) => {
    setPicks((current) => ({ ...clonePicks(current), f: slot }));
  }, []);

  const selectThird = useCallback((slot: number) => {
    setPicks((current) => ({ ...clonePicks(current), third: slot }));
  }, []);

  const lines = useMemo(
    () => [
      ...connectorLines(0, "right", leftX[0], 8),
      ...connectorLines(1, "right", leftX[1], 4),
      ...connectorLines(2, "right", leftX[2], 2),
      ...connectorLines(0, "left", rightX[0], 8),
      ...connectorLines(1, "left", rightX[1], 4),
      ...connectorLines(2, "left", rightX[2], 2),
    ],
    [],
  );

  const sfY = cardMidY(3, 0);
  const sfLRight = sfLX + CW;
  const sfRLeft = rightX[3];
  const fcX = Math.round((sfLRight + sfRLeft - CW) / 2);
  const fcY = cardTop(3, 0);
  const champGap = 12;
  const champH = 110;
  const champX = Math.round((TOTAL_W - CHAMP_BOX_W) / 2);
  const champY = fcY - champGap - champH;
  const thirdY = fcY + CH + 86;
  const thirdX = Math.round((TOTAL_W - CW) / 2);
  const phaseLabels = [
    { label: "Round of 32", x: leftX[0] },
    { label: "Round of 16", x: leftX[1] },
    { label: "Quarterfinals", x: leftX[2] },
    { label: "Semifinals", x: sfLX },
    { label: "Final", x: Math.round((TOTAL_W - CW) / 2) },
    { label: "Semifinals", x: rightX[3] },
    { label: "Quarterfinals", x: rightX[2] },
    { label: "Round of 16", x: rightX[1] },
    { label: "Round of 32", x: rightX[0] },
  ];

  return (
    <main className="wc-bracket">
      <header className="wc-topbar">
        <div className="wc-title">FIFA World Cup 2026 — Bracket</div>
        <p className="wc-sub">Click upcoming matches to predict winners · Completed matches locked</p>
        <div className="wc-legend">
          <span className="wc-leg"><span className="wc-dot done" />Completed</span>
          <span className="wc-leg"><span className="wc-dot live" />Live / Today</span>
          <span className="wc-leg"><span className="wc-dot upcoming" />Picked</span>
        </div>
        <div className="wc-actions">
          <button type="button" className="wc-rbtn" onClick={() => setPicks(emptyPicks())}>
            <RotateCcw size={13} />
            Reset Picks
          </button>
          <button type="button" className="wc-rbtn" onClick={refreshBracket} disabled={isRefreshing}>
            <RefreshCcw size={13} className={isRefreshing ? "wc-spin" : ""} />
            {isRefreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>
        <p className="wc-sync">
          {syncError ? `Using fallback data: ${syncError}` : `Updated ${formatUpdatedAt(bracket.updatedAt)} · ${bracket.source}`}
        </p>
      </header>

      <div className="wc-outer">
        <div className="wc-phase-labels" style={{ width: TOTAL_W }}>
          {phaseLabels.map((phase) => (
            <div key={`${phase.label}-${phase.x}`} className="wc-plbl" style={{ left: phase.x, width: CW }}>
              {phase.label}
            </div>
          ))}
        </div>

        <div className="wc-arena" style={{ width: TOTAL_W, height: TOTAL_H }}>
          <svg className="wc-svg-layer" width={TOTAL_W} height={TOTAL_H}>
            {lines}
            <Line x1={sfLRight} y1={sfY} x2={fcX} y2={sfY} color="#b45309" />
            <Line x1={sfRLeft} y1={sfY} x2={fcX + CW} y2={sfY} color="#b45309" />
            <Line x1={fcX + CW / 2} y1={champY + champH} x2={fcX + CW / 2} y2={fcY} color="#b45309" />
          </svg>

          {bracket.r32.slice(0, 8).map((match, index) => (
            <MatchCard
              key={match.eventId}
              x={leftX[0]}
              y={cardTop(0, index)}
              match={match}
              teamA={match.teams[0]}
              teamB={match.teams[1]}
              winner={r32w(index)}
              onPickA={() => selectPick("r32", index, 0)}
              onPickB={() => selectPick("r32", index, 1)}
            />
          ))}

          {bracket.r16.slice(0, 4).map((match, index) => (
            <MatchCard
              key={match.eventId}
              x={leftX[1]}
              y={cardTop(1, index)}
              match={match}
              teamA={r16t(index, 0)}
              teamB={r16t(index, 1)}
              winner={r16w(index)}
              onPickA={() => selectPick("r16", index, 0)}
              onPickB={() => selectPick("r16", index, 1)}
            />
          ))}

          {bracket.qf.slice(0, 2).map((match, index) => (
            <MatchCard
              key={match.eventId}
              x={leftX[2]}
              y={cardTop(2, index)}
              match={match}
              teamA={qft(index, 0)}
              teamB={qft(index, 1)}
              winner={qfw(index)}
              onPickA={() => selectPick("qf", index, 0)}
              onPickB={() => selectPick("qf", index, 1)}
            />
          ))}

          <MatchCard
            x={sfLX}
            y={cardTop(3, 0)}
            match={bracket.sf[0]}
            teamA={sft(0, 0)}
            teamB={sft(0, 1)}
            winner={sfw(0)}
            onPickA={() => selectPick("sf", 0, 0)}
            onPickB={() => selectPick("sf", 0, 1)}
          />

          {bracket.r32.slice(8, 16).map((match, offset) => {
            const index = offset + 8;
            return (
              <MatchCard
                key={match.eventId}
                x={rightX[0]}
                y={cardTop(0, offset)}
                match={match}
                teamA={match.teams[0]}
                teamB={match.teams[1]}
                winner={r32w(index)}
                onPickA={() => selectPick("r32", index, 0)}
                onPickB={() => selectPick("r32", index, 1)}
              />
            );
          })}

          {bracket.r16.slice(4, 8).map((match, offset) => {
            const index = offset + 4;
            return (
              <MatchCard
                key={match.eventId}
                x={rightX[1]}
                y={cardTop(1, offset)}
                match={match}
                teamA={r16t(index, 0)}
                teamB={r16t(index, 1)}
                winner={r16w(index)}
                onPickA={() => selectPick("r16", index, 0)}
                onPickB={() => selectPick("r16", index, 1)}
              />
            );
          })}

          {bracket.qf.slice(2, 4).map((match, offset) => {
            const index = offset + 2;
            return (
              <MatchCard
                key={match.eventId}
                x={rightX[2]}
                y={cardTop(2, offset)}
                match={match}
                teamA={qft(index, 0)}
                teamB={qft(index, 1)}
                winner={qfw(index)}
                onPickA={() => selectPick("qf", index, 0)}
                onPickB={() => selectPick("qf", index, 1)}
              />
            );
          })}

          <MatchCard
            x={rightX[3]}
            y={cardTop(3, 0)}
            match={bracket.sf[1]}
            teamA={sft(1, 0)}
            teamB={sft(1, 1)}
            winner={sfw(1)}
            onPickA={() => selectPick("sf", 1, 0)}
            onPickB={() => selectPick("sf", 1, 1)}
          />

          <MatchCard
            x={fcX}
            y={fcY}
            match={bracket.final}
            teamA={fint(0)}
            teamB={fint(1)}
            winner={finalWinner}
            onPickA={() => selectFinal(0)}
            onPickB={() => selectFinal(1)}
            extraClassName="final-card"
          />

          <div className="wc-champ-box" style={{ left: champX, top: champY, width: CHAMP_BOX_W }}>
            {champion ? (
              <>
                <span className="wc-champ-flag-big">{champion.flag}</span>
                <div className="wc-champ-lbl">🏆 Champion</div>
                <div className="wc-champ-name-text">{champion.name}</div>
              </>
            ) : (
              <>
                <span className="wc-champ-trophy-icon">🏆</span>
                <div className="wc-champ-lbl">Champion</div>
                <div className="wc-champ-tbd">Fill in the bracket</div>
              </>
            )}
          </div>

          <div className="wc-third-label" style={{ left: thirdX, top: thirdY - 18, width: CW }}>
            3rd Place
          </div>
          <MatchCard
            x={thirdX}
            y={thirdY}
            match={bracket.third}
            teamA={bracket.third.teams[0] ?? sf0Loser}
            teamB={bracket.third.teams[1] ?? sf1Loser}
            winner={thirdWinner}
            onPickA={() => selectThird(0)}
            onPickB={() => selectThird(1)}
            extraClassName="third-card"
          />
        </div>
      </div>

      <style>{`
        .wc-bracket, .wc-bracket * { box-sizing: border-box; }
        .wc-bracket {
          min-height: 100vh;
          overflow-x: auto;
          background: #f0ede8;
          color: #111827;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 12px;
        }
        .wc-topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          border-bottom: 1px solid #d1d5db;
          background: #fff;
          padding: 20px 20px 12px;
          text-align: center;
        }
        .wc-title {
          color: #b45309;
          font-size: clamp(18px, 3vw, 30px);
          font-weight: 800;
          letter-spacing: 0;
          line-height: 1.1;
        }
        .wc-sub {
          margin-top: 3px;
          color: #6b7280;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .wc-legend {
          display: inline-flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-top: 7px;
          color: #6b7280;
          font-size: 10px;
        }
        .wc-leg { display: inline-flex; align-items: center; gap: 4px; }
        .wc-dot { width: 7px; height: 7px; border-radius: 50%; }
        .wc-dot.done { background: #9ca3af; }
        .wc-dot.live { background: #d97706; }
        .wc-dot.upcoming { background: #15803d; }
        .wc-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }
        .wc-rbtn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #d1d5db;
          border-radius: 3px;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 5px 12px;
          text-transform: uppercase;
          transition: color 0.15s, border-color 0.15s;
        }
        .wc-rbtn:hover:not(:disabled) { border-color: #3b5bdb; color: #3b5bdb; }
        .wc-rbtn:disabled { cursor: default; opacity: 0.65; }
        .wc-spin { animation: wc-spin 0.8s linear infinite; }
        .wc-sync {
          margin-top: 7px;
          color: #9ca3af;
          font-size: 10px;
        }
        .wc-outer { overflow-x: auto; padding: 28px 24px 56px; }
        .wc-phase-labels { position: relative; height: 22px; margin-bottom: 8px; }
        .wc-plbl {
          position: absolute;
          color: #3b5bdb;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-align: center;
          text-transform: uppercase;
        }
        .wc-arena { position: relative; }
        .wc-svg-layer { position: absolute; left: 0; top: 0; pointer-events: none; }
        .wc-card {
          position: absolute;
          z-index: 2;
          overflow: hidden;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
        }
        .wc-card.today {
          border-color: #d97706;
          box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.13);
        }
        .wc-card.final-card {
          border-color: #b45309;
          box-shadow: 0 0 0 3px rgba(180, 83, 9, 0.1);
        }
        .wc-card.third-card { border-color: #6b7280; }
        .wc-team {
          position: relative;
          display: flex;
          align-items: center;
          gap: 5px;
          width: 100%;
          height: 28px;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          font: inherit;
          padding: 0 7px;
          text-align: left;
          transition: background 0.1s;
          user-select: none;
        }
        .wc-team + .wc-team { border-top: 1px solid #f3f4f6; }
        .wc-team:hover:not(.locked):not(.elim):not(.tbd) { background: #eff6ff; }
        .wc-team.win { background: #f0fdf4; }
        .wc-team.elim { background: #f9fafb; }
        .wc-team.tbd, .wc-team.locked { cursor: default; }
        .wc-team.win::before {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          border-radius: 6px 0 0 6px;
          background: #15803d;
          content: "";
        }
        .wc-wd {
          width: 4px;
          height: 4px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #15803d;
          opacity: 0;
        }
        .wc-team.win .wc-wd { opacity: 1; }
        .wc-flag { width: 16px; flex-shrink: 0; font-size: 12px; text-align: center; }
        .wc-nm {
          min-width: 0;
          flex: 1;
          overflow: hidden;
          color: #111827;
          font-size: 10px;
          font-weight: 500;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .wc-team.elim .wc-nm, .wc-team.tbd .wc-nm { color: #9ca3af; font-weight: 400; }
        .wc-sc {
          flex-shrink: 0;
          color: #6b7280;
          font-size: 8.5px;
          font-weight: 700;
        }
        .wc-team.win .wc-sc { color: #15803d; }
        .wc-meta {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 3px;
          color: #4b5563;
          font-size: 8.5px;
          white-space: nowrap;
        }
        .wc-chip-done, .wc-chip-live, .wc-chip-today {
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .wc-chip-done { color: #6b7280; }
        .wc-chip-live, .wc-chip-today { color: #d97706; }
        .wc-mloc { color: #374151; font-weight: 600; }
        .wc-msep { color: #d1d5db; }
        .wc-mdt { color: #4b5563; }
        .wc-champ-box {
          position: absolute;
          z-index: 10;
          border: 2px solid #b45309;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(180, 83, 9, 0.07), 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 10px 14px 12px;
          text-align: center;
        }
        .wc-champ-flag-big { display: block; margin-bottom: 2px; font-size: 40px; line-height: 1; }
        .wc-champ-trophy-icon { display: block; margin-bottom: 4px; font-size: 32px; line-height: 1; opacity: 0.4; }
        .wc-champ-lbl {
          margin-bottom: 3px;
          color: #b45309;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .wc-champ-name-text { color: #111827; font-size: 13px; font-weight: 800; }
        .wc-champ-tbd { color: #9ca3af; font-size: 9px; }
        .wc-third-label {
          position: absolute;
          color: #6b7280;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-align: center;
          text-transform: uppercase;
        }
        @keyframes wc-spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
