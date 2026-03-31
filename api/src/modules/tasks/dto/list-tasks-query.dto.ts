export type ListTasksQueryDto = {
  status?: 'all' | 'open' | 'completed';
  search?: string;
};
