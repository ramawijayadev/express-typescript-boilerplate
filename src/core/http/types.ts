import type { Request } from "express";

export type TypedRequest<
  Body = any,
  Query = any,
  Params = any,
> = Request<Params, any, Body, Query>;

export interface AuthenticatedRequest<
  Body = unknown,
  Query = unknown,
  Params = unknown,
> extends TypedRequest<Body, Query, Params> {
  user: {
    id: number;
  };
}
