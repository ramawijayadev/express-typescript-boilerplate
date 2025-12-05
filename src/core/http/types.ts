import type { Request } from "express";

export type TypedRequest<
  Body = unknown,
  Query = any,
  Params = any,
> = Request<Params, unknown, Body, Query>;
