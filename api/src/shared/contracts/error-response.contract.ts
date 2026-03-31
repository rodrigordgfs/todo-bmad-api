export type ErrorResponseDetail = {
  field: string;
  message: string;
  code: string;
};

export type ErrorResponseContract = {
  statusCode: number;
  code: string;
  message: string;
  details: ErrorResponseDetail[];
};
