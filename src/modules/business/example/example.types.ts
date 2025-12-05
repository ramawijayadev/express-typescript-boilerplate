export type ExampleId = number;

export interface Example {
  id: ExampleId;
  name: string;
  description?: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ListExamplesFilter {
  search?: string;
}
