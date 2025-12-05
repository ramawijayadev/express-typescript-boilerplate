import { Request } from "express";

export interface TypedRequest<
  Body = unknown,
  Query = any,
  Params = any,
> extends Request<Params, unknown, Body, Query> {}
