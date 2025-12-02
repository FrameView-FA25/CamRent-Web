export const STATUS_MAP: Record<string, number> = {
  "Chờ xác nhận": 0,
  "Đã xác nhận": 1,
  "Đang thuê": 2,
  "Hoàn thành": 3,
  "Đã hủy": 4,
};

export const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
export const DEFAULT_ROWS_PER_PAGE = 10;