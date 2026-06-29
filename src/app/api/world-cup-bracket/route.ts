import { NextResponse } from "next/server";
import {
  FINAL_EVENT_ID,
  QF_EVENT_IDS,
  R16_EVENT_IDS,
  R32_EVENT_IDS,
  SF_EVENT_IDS,
  THIRD_EVENT_ID,
  fallbackBracket,
  type BracketMatch,
  type BracketPayload,
  type BracketStatus,
  type BracketTeam,
} from "@/features/world-cup-bracket/data/bracket";

export const dynamic = "force-dynamic";

const ESPN_SCOREBOARD_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260628-20260719&limit=100";
const ESPN_FETCH_TIMEOUT_MS = 6000;

const flagByAbbreviation: Record<string, string> = {
  ALG: "🇩🇿",
  ARG: "🇦🇷",
  AUS: "🇦🇺",
  AUT: "🇦🇹",
  BEL: "🇧🇪",
  BIH: "🇧🇦",
  BRA: "🇧🇷",
  CAN: "🇨🇦",
  CIV: "🇨🇮",
  COD: "🇨🇩",
  COL: "🇨🇴",
  CPV: "🇨🇻",
  CRO: "🇭🇷",
  ECU: "🇪🇨",
  EGY: "🇪🇬",
  ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  ESP: "🇪🇸",
  FRA: "🇫🇷",
  GER: "🇩🇪",
  GHA: "🇬🇭",
  JPN: "🇯🇵",
  MAR: "🇲🇦",
  MEX: "🇲🇽",
  NED: "🇳🇱",
  NOR: "🇳🇴",
  PAR: "🇵🇾",
  POR: "🇵🇹",
  RSA: "🇿🇦",
  SEN: "🇸🇳",
  SUI: "🇨🇭",
  SWE: "🇸🇪",
  USA: "🇺🇸",
};

const stateAbbreviations: Record<string, string> = {
  California: "CA",
  Florida: "FL",
  Georgia: "GA",
  Massachusetts: "MA",
  Missouri: "MO",
  "New Jersey": "NJ",
  Pennsylvania: "PA",
  Texas: "TX",
  Washington: "WA",
};

const venueRegionByCity: Record<string, string> = {
  Atlanta: "GA",
  Arlington: "TX",
  "East Rutherford": "NJ",
  Foxborough: "MA",
  Guadalupe: "NL",
  Houston: "TX",
  Inglewood: "CA",
  "Kansas City": "MO",
  "Mexico City": "CDMX",
  "Miami Gardens": "FL",
  Philadelphia: "PA",
  "Santa Clara": "CA",
  Seattle: "WA",
  Toronto: "ON",
  Vancouver: "BC",
};

const venueTimeZoneByRegion: Record<string, string> = {
  BC: "America/Vancouver",
  CA: "America/Los_Angeles",
  CDMX: "America/Mexico_City",
  FL: "America/New_York",
  GA: "America/New_York",
  MA: "America/New_York",
  MO: "America/Chicago",
  NJ: "America/New_York",
  NL: "America/Monterrey",
  ON: "America/Toronto",
  PA: "America/New_York",
  TX: "America/Chicago",
  WA: "America/Los_Angeles",
};

const preferredNames: Record<string, string> = {
  "467": "S. Africa",
  "452": "Bosnia",
  "4789": "Ivory Cst",
};

type EspnCompetition = {
  date?: string;
  competitors?: EspnCompetitor[];
  status?: EspnStatus;
  venue?: {
    displayName?: string;
    fullName?: string;
    address?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
};

type EspnCompetitor = {
  order?: number;
  winner?: boolean;
  score?: string;
  team?: {
    id?: string;
    abbreviation?: string;
    displayName?: string;
    shortDisplayName?: string;
    name?: string;
    location?: string;
    isActive?: boolean;
  };
};

type EspnEvent = {
  id?: string;
  date?: string;
  competitions?: EspnCompetition[];
};

type EspnScoreboard = {
  events?: EspnEvent[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPlaceholderTeam(competitor: EspnCompetitor) {
  const team = competitor.team;
  if (!team) return true;
  if (team.isActive === false) return true;

  const label = [
    team.abbreviation,
    team.displayName,
    team.shortDisplayName,
    team.name,
    team.location,
  ]
    .filter(Boolean)
    .join(" ");

  return /\b(Winner|Loser|RD32|RD16|QFW|QF W|SF W|SF L)\b/i.test(label);
}

function normalizeTeam(competitor: EspnCompetitor): BracketTeam | null {
  if (isPlaceholderTeam(competitor)) return null;

  const team = competitor.team;
  const abbreviation = team?.abbreviation ?? "";
  const id = team?.id;
  const name =
    (id ? preferredNames[id] : undefined) ??
    team?.shortDisplayName ??
    team?.displayName ??
    team?.name ??
    abbreviation;

  if (!name) return null;

  return {
    id,
    abbreviation,
    flag: flagByAbbreviation[abbreviation] ?? "",
    name,
  };
}

function venueParts(competition: EspnCompetition, fallback: string) {
  const address = competition.venue?.address;
  const rawCity = address?.city;
  const state = address?.state;

  if (!rawCity) {
    const [fallbackCity, fallbackRegion] = fallback
      .split(",")
      .map((part) => part.trim());
    return {
      city: fallbackCity,
      region: fallbackRegion ?? venueRegionByCity[fallbackCity] ?? "",
    };
  }

  const [cityPart, statePart] = rawCity.split(",").map((part) => part.trim());
  const normalizedState = state ?? statePart;
  const region =
    (normalizedState ? stateAbbreviations[normalizedState] : undefined) ??
    venueRegionByCity[cityPart] ??
    "";

  return { city: cityPart, region };
}

function shortVenue(competition: EspnCompetition, fallback: string) {
  const { city, region } = venueParts(competition, fallback);
  return region ? `${city}, ${region}` : city;
}

function venueTimeZone(competition: EspnCompetition, fallback: string) {
  const { region } = venueParts(competition, fallback);
  return venueTimeZoneByRegion[region] ?? "UTC";
}

function formatDate(date: string | undefined, fallback: string, timeZone: string) {
  if (!date) return fallback;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return fallback;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone,
  }).format(parsed);
}

function eventDay(date: string | undefined, timeZone: string) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "short",
    timeZone,
  }).format(parsed);
}

function todayInTimeZone(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "short",
    timeZone,
  }).format(new Date());
}

function normalizeStatus(
  status: EspnStatus | undefined,
  date: string | undefined,
  timeZone: string,
): BracketStatus {
  if (status?.type?.completed) return "done";

  const state = status?.type?.state;
  if (state === "in") return "live";
  if (eventDay(date, timeZone) === todayInTimeZone(timeZone)) return "today";

  return "upcoming";
}

type EspnStatus = {
  type?: {
    completed?: boolean;
    state?: string;
    detail?: string;
    shortDetail?: string;
  };
};

function normalizeEvent(event: EspnEvent | undefined, fallback: BracketMatch): BracketMatch {
  const competition = event?.competitions?.[0];
  if (!event || !competition) return fallback;

  const competitors = [...(competition.competitors ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const teams: [BracketTeam | null, BracketTeam | null] = [
    normalizeTeam(competitors[0] ?? {}),
    normalizeTeam(competitors[1] ?? {}),
  ];
  const completed = competition.status?.type?.completed === true;
  const winnerIndex = completed
    ? competitors.findIndex((competitor) => competitor.winner === true)
    : -1;
  const score =
    completed || competition.status?.type?.state === "in"
      ? competitors.map((competitor) => competitor.score ?? "0").join("-")
      : null;
  const eventDate = competition.date ?? event.date;
  const timeZone = venueTimeZone(competition, fallback.loc);

  return {
    ...fallback,
    eventId: event.id ?? fallback.eventId,
    teams: [teams[0] ?? fallback.teams[0], teams[1] ?? fallback.teams[1]],
    loc: shortVenue(competition, fallback.loc),
    date: formatDate(eventDate, fallback.date, timeZone),
    status: normalizeStatus(competition.status, eventDate, timeZone),
    winner: winnerIndex >= 0 ? winnerIndex : null,
    score,
    detail: competition.status?.type?.shortDetail ?? competition.status?.type?.detail,
  };
}

function eventMap(scoreboard: EspnScoreboard) {
  const events = new Map<string, EspnEvent>();

  for (const event of scoreboard.events ?? []) {
    if (typeof event.id === "string") {
      events.set(event.id, event);
    }
  }

  return events;
}

function normalizePayload(scoreboard: EspnScoreboard): BracketPayload {
  const events = eventMap(scoreboard);

  return {
    source: "ESPN FIFA World Cup scoreboard",
    updatedAt: new Date().toISOString(),
    r32: R32_EVENT_IDS.map((id, index) =>
      normalizeEvent(events.get(id), fallbackBracket.r32[index]),
    ),
    r16: R16_EVENT_IDS.map((id, index) =>
      normalizeEvent(events.get(id), fallbackBracket.r16[index]),
    ),
    qf: QF_EVENT_IDS.map((id, index) =>
      normalizeEvent(events.get(id), fallbackBracket.qf[index]),
    ),
    sf: SF_EVENT_IDS.map((id, index) =>
      normalizeEvent(events.get(id), fallbackBracket.sf[index]),
    ),
    final: normalizeEvent(events.get(FINAL_EVENT_ID), fallbackBracket.final),
    third: normalizeEvent(events.get(THIRD_EVENT_ID), fallbackBracket.third),
  };
}

function isScoreboard(value: unknown): value is EspnScoreboard {
  return isRecord(value) && Array.isArray(value.events);
}

export async function GET() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ESPN_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(ESPN_SCOREBOARD_URL, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      throw new Error(`ESPN returned ${response.status}`);
    }

    const data: unknown = await response.json();
    if (!isScoreboard(data)) {
      throw new Error("ESPN returned an unexpected payload");
    }

    return NextResponse.json(normalizePayload(data), {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ...fallbackBracket,
        source: "Embedded fallback",
        updatedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown fetch error",
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}
