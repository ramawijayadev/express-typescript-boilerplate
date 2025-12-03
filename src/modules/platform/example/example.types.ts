export type ExampleId = string;

export interface Example {
  id: ExampleId;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListExamplesFilter {
  search?: string;
}
