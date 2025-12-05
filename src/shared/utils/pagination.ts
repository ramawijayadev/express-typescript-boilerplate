import type { PaginatedMeta } from "@/shared/types/pagination";
import type { Request } from "express";

export function generatePaginationLinks(
  req: Request<any, any, any, any>,
  meta: PaginatedMeta,
): Record<string, string | null> {
  const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;
  const query = { ...req.query };

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(query as Record<string, string>);
    params.set("page", page.toString());
    params.set("limit", meta.limit.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  return {
    first: buildUrl(1),
    last: buildUrl(meta.totalPages),
    prev: meta.page > 1 ? buildUrl(meta.page - 1) : null,
    next: meta.page < meta.totalPages ? buildUrl(meta.page + 1) : null,
  };
}
