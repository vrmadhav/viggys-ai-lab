export type BracketStatus = "done" | "live" | "today" | "upcoming";

export type BracketTeam = {
  id?: string;
  flag: string;
  name: string;
  abbreviation?: string;
};

export type BracketMatch = {
  eventId: string;
  teams: [BracketTeam | null, BracketTeam | null];
  loc: string;
  date: string;
  status: BracketStatus;
  winner: number | null;
  score: string | null;
  detail?: string;
};

export type BracketPayload = {
  source: string;
  updatedAt: string;
  r32: BracketMatch[];
  r16: BracketMatch[];
  qf: BracketMatch[];
  sf: BracketMatch[];
  final: BracketMatch;
  third: BracketMatch;
};

export type PickState = {
  r32: Array<number | null>;
  r16: Array<number | null>;
  qf: Array<number | null>;
  sf: Array<number | null>;
  f: number | null;
  third: number | null;
};

const t = (
  flag: string,
  name: string,
  abbreviation?: string,
  id?: string,
): BracketTeam => ({ flag, name, abbreviation, id });

export const R32_EVENT_IDS = [
  "760486",
  "760488",
  "760489",
  "760492",
  "760494",
  "760493",
  "760496",
  "760497",
  "760487",
  "760490",
  "760491",
  "760495",
  "760498",
  "760501",
  "760500",
  "760499",
] as const;

export const R16_EVENT_IDS = [
  "760502",
  "760503",
  "760507",
  "760506",
  "760504",
  "760505",
  "760508",
  "760509",
] as const;

export const QF_EVENT_IDS = ["760510", "760511", "760512", "760513"] as const;
export const SF_EVENT_IDS = ["760514", "760515"] as const;
export const THIRD_EVENT_ID = "760516";
export const FINAL_EVENT_ID = "760517";

export const emptyPicks = (): PickState => ({
  r32: Array(16).fill(null),
  r16: Array(8).fill(null),
  qf: Array(4).fill(null),
  sf: Array(2).fill(null),
  f: null,
  third: null,
});

export const fallbackBracket: BracketPayload = {
  source: "Embedded fallback",
  updatedAt: "2026-07-04T02:00:00.000Z",
  r32: [
    {
      eventId: "760486",
      teams: [t("🇿🇦", "S. Africa", "RSA", "467"), t("🇨🇦", "Canada", "CAN", "206")],
      loc: "Inglewood, CA",
      date: "Jun 28",
      status: "done",
      winner: 1,
      score: "0-1",
    },
    {
      eventId: "760488",
      teams: [t("🇳🇱", "Netherlands", "NED"), t("🇲🇦", "Morocco", "MAR")],
      loc: "Guadalupe, NL",
      date: "Jun 29",
      status: "done",
      winner: 1,
      score: "1-1",
      detail: "FT-Pens",
    },
    {
      eventId: "760489",
      teams: [t("🇩🇪", "Germany", "GER"), t("🇵🇾", "Paraguay", "PAR")],
      loc: "Foxborough, MA",
      date: "Jun 29",
      status: "done",
      winner: 1,
      score: "1-1",
      detail: "FT-Pens",
    },
    {
      eventId: "760492",
      teams: [t("🇫🇷", "France", "FRA"), t("🇸🇪", "Sweden", "SWE")],
      loc: "East Rutherford, NJ",
      date: "Jun 30",
      status: "done",
      winner: 0,
      score: "3-0",
    },
    {
      eventId: "760494",
      teams: [t("🇺🇸", "USA", "USA"), t("🇧🇦", "Bosnia", "BIH")],
      loc: "Santa Clara, CA",
      date: "Jul 1",
      status: "done",
      winner: 0,
      score: "2-0",
    },
    {
      eventId: "760493",
      teams: [t("🇧🇪", "Belgium", "BEL"), t("🇸🇳", "Senegal", "SEN")],
      loc: "Seattle, WA",
      date: "Jul 1",
      status: "done",
      winner: 0,
      score: "3-2",
      detail: "AET",
    },
    {
      eventId: "760496",
      teams: [t("🇵🇹", "Portugal", "POR"), t("🇭🇷", "Croatia", "CRO")],
      loc: "Toronto, ON",
      date: "Jul 2",
      status: "done",
      winner: 0,
      score: "2-1",
    },
    {
      eventId: "760497",
      teams: [t("🇪🇸", "Spain", "ESP"), t("🇦🇹", "Austria", "AUT")],
      loc: "Inglewood, CA",
      date: "Jul 2",
      status: "done",
      winner: 0,
      score: "3-0",
    },
    {
      eventId: "760487",
      teams: [t("🇧🇷", "Brazil", "BRA"), t("🇯🇵", "Japan", "JPN")],
      loc: "Houston, TX",
      date: "Jun 29",
      status: "done",
      winner: 0,
      score: "2-1",
    },
    {
      eventId: "760490",
      teams: [t("🇨🇮", "Ivory Cst", "CIV"), t("🇳🇴", "Norway", "NOR")],
      loc: "Arlington, TX",
      date: "Jun 30",
      status: "done",
      winner: 1,
      score: "1-2",
    },
    {
      eventId: "760491",
      teams: [t("🇲🇽", "Mexico", "MEX"), t("🇪🇨", "Ecuador", "ECU")],
      loc: "Mexico City, CDMX",
      date: "Jun 30",
      status: "done",
      winner: 0,
      score: "2-0",
    },
    {
      eventId: "760495",
      teams: [t("🏴󠁧󠁢󠁥󠁮󠁧󠁿", "England", "ENG"), t("🇨🇩", "Congo DR", "COD")],
      loc: "Atlanta, GA",
      date: "Jul 1",
      status: "done",
      winner: 0,
      score: "2-1",
    },
    {
      eventId: "760498",
      teams: [t("🇨🇭", "Switzerland", "SUI"), t("🇩🇿", "Algeria", "ALG")],
      loc: "Vancouver, BC",
      date: "Jul 2",
      status: "done",
      winner: 0,
      score: "2-0",
    },
    {
      eventId: "760501",
      teams: [t("🇨🇴", "Colombia", "COL"), t("🇬🇭", "Ghana", "GHA")],
      loc: "Kansas City, MO",
      date: "Jul 3",
      status: "done",
      winner: 0,
      score: "1-0",
    },
    {
      eventId: "760500",
      teams: [t("🇦🇷", "Argentina", "ARG"), t("🇨🇻", "Cape Verde", "CPV")],
      loc: "Miami Gardens, FL",
      date: "Jul 3",
      status: "done",
      winner: 0,
      score: "3-2",
      detail: "AET",
    },
    {
      eventId: "760499",
      teams: [t("🇦🇺", "Australia", "AUS"), t("🇪🇬", "Egypt", "EGY")],
      loc: "Arlington, TX",
      date: "Jul 3",
      status: "done",
      winner: 1,
      score: "1-1",
      detail: "FT-Pens",
    },
  ],
  r16: [
    { eventId: "760502", teams: [null, null], loc: "Houston, TX", date: "Jul 4", status: "upcoming", winner: null, score: null },
    { eventId: "760503", teams: [null, null], loc: "Philadelphia, PA", date: "Jul 4", status: "upcoming", winner: null, score: null },
    { eventId: "760507", teams: [null, null], loc: "Seattle, WA", date: "Jul 6", status: "upcoming", winner: null, score: null },
    { eventId: "760506", teams: [null, null], loc: "Arlington, TX", date: "Jul 6", status: "upcoming", winner: null, score: null },
    { eventId: "760504", teams: [null, null], loc: "East Rutherford, NJ", date: "Jul 5", status: "upcoming", winner: null, score: null },
    { eventId: "760505", teams: [null, null], loc: "Mexico City, CDMX", date: "Jul 5", status: "upcoming", winner: null, score: null },
    { eventId: "760508", teams: [null, null], loc: "Vancouver, BC", date: "Jul 7", status: "upcoming", winner: null, score: null },
    { eventId: "760509", teams: [null, null], loc: "Atlanta, GA", date: "Jul 7", status: "upcoming", winner: null, score: null },
  ],
  qf: [
    { eventId: "760510", teams: [null, null], loc: "Foxborough, MA", date: "Jul 9", status: "upcoming", winner: null, score: null },
    { eventId: "760511", teams: [null, null], loc: "Inglewood, CA", date: "Jul 10", status: "upcoming", winner: null, score: null },
    { eventId: "760512", teams: [null, null], loc: "Miami Gardens, FL", date: "Jul 11", status: "upcoming", winner: null, score: null },
    { eventId: "760513", teams: [null, null], loc: "Kansas City, MO", date: "Jul 11", status: "upcoming", winner: null, score: null },
  ],
  sf: [
    { eventId: "760514", teams: [null, null], loc: "Arlington, TX", date: "Jul 14", status: "upcoming", winner: null, score: null },
    { eventId: "760515", teams: [null, null], loc: "Atlanta, GA", date: "Jul 15", status: "upcoming", winner: null, score: null },
  ],
  final: {
    eventId: "760517",
    teams: [null, null],
    loc: "East Rutherford, NJ",
    date: "Jul 19",
    status: "upcoming",
    winner: null,
    score: null,
  },
  third: {
    eventId: "760516",
    teams: [null, null],
    loc: "Miami Gardens, FL",
    date: "Jul 18",
    status: "upcoming",
    winner: null,
    score: null,
  },
};
