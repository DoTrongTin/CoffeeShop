import type { Response } from 'express';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

/** Trả về 200 OK với { data } hoặc { data, meta } */
export const sendData = <T>(response: Response, data: T, meta?: PaginationMeta): void => {
  const body: Record<string, unknown> = { data };
  if (meta) body.meta = meta;
  response.json(body);
};

/** Trả về 201 Created với { data } */
export const sendCreated = <T>(response: Response, data: T): void => {
  response.status(201).json({ data });
};

/** Trả về 204 No Content (không có body) */
export const sendNoContent = (response: Response): void => {
  response.status(204).send();
};
