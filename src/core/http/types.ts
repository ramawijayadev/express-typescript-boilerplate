import type { Request } from "express";

export type TypedRequest<
  Body = unknown,
  Query = unknown,
  Params = unknown,
> = Request<Params, unknown, Body, Query>;
