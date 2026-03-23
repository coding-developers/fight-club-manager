export interface Meta {
  metadata: {
    count: number;
    page: number;
    next: string | null;
    previous: string | null;
    total_pages: number;
    total_results: number;
  };
}
