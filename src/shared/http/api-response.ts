import type { Response } from "express";

interface SuccessMeta {
  page?: number;
  pageSize?: number;
  total?: number;
}

export function ok<T>(res: Response, data: T, meta?: SuccessMeta) {
  return res.status(200).json({
    success: true,
    data,
    meta: meta ?? null,
  });
}

export function created<T>(res: Response, data: T) {
  return res.status(201).json({
    success: true,
    data,
    meta: null,
  });
}

export function noContent(res: Response) {
  return res.status(204).send();
}
