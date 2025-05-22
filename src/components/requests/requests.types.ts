export enum RequestStatus {
  Pending = 'Pending', // Initial state for all new requests
  InProgress = 'InProgress', // Request is being actively worked on
  Resolved = 'Resolved', // Request has been successfully fulfilled
  Rejected = 'Rejected', // Request has been canceled/rejected
}

export enum RequestActionType {
  Comment = 'Comment', // Add a comment or note to the request without changing its status
  Accept = 'Accept', // Accept the request and move it to processing
  Resolve = 'Resolve', // Mark the request as resolved
  Reject = 'Reject', // Reject or deny the request
  Reopen = 'Reopen', // Reopen a previously closed or resolved request
}

export type ListRequestsOptions = {
  fromDate?: Date;
  toDate?: Date;
  page: number;
  perPage: number;
};

export type CreateRequestInput = {
  title: string;
  content: string;
};

export type UpdateRequestInput = {
  status?: RequestStatus;
  message?: string;
};

export type RequestItem = {
  id: number;
  title: string;
  content: string;
  status: RequestStatus;
  history: RequestActionItem[];
  createdAt: Date;
  updateAt: Date;
};

export type RequestActionItem = {
  id: number;
  type: RequestActionType;
  content: string | null;
};

export type ListRequestsResponse = {
  items: RequestItem[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};
