import type { Request } from "express";

export type TypedRequest<
  Body = unknown,
  Query = unknown,
  Params = unknown,
> = Request<Params, unknown, Body, Query>;

export interface AuthenticatedRequest<
  Body = unknown,
  Query = unknown,
  Params = unknown,
> extends TypedRequest<Body, Query, Params> {
  user: {
    id: number;
  };
}
