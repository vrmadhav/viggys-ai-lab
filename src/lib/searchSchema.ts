export type ExperimentsSearch = {
  q: string;
  tag: string;
  status: string;
};

export function validateExperimentsSearch(
  raw: Record<string, unknown>,
): ExperimentsSearch {
  const allowedStatus = ["All", "Live", "In Progress", "Archived"];
  const q = typeof raw.q === "string" ? raw.q : "";
  const tag = typeof raw.tag === "string" ? raw.tag : "";
  const statusRaw = typeof raw.status === "string" ? raw.status : "All";
  const status = allowedStatus.includes(statusRaw) ? statusRaw : "All";
  return { q, tag, status };
}
