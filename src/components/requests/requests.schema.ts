import { PaginationSchema } from '@backend/common/schema';
import { RequestStatus } from '@backend/components/requests/requests.types';
import dayjs from 'dayjs';
import { date, object, string } from 'yup';

function unixToDate(v, original) {
  return original ? dayjs.unix(original).toDate() : original;
}

export const ListRequestsQuery = object()
  .shape({
    fromDate: date().transform(unixToDate),
    toDate: date().transform(unixToDate),
  })
  .concat(PaginationSchema);

export const CreateRequestBody = object().shape({
  title: string().max(128).required(),
  content: string().max(4096).required(),
});

export const UpdateRequestBody = object().shape({
  status: string().oneOf(Object.values(RequestStatus)),
  message: string().max(4096),
});
export const RequestActionBody = object().shape({
  message: string().max(4096),
});
