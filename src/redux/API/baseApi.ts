import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { logout, setAccessToken } from '../Features/Auth/authSlice';
import { RootState } from '../store';

const CSRF_ENDPOINT = '/csrf-token';
const REFRESH_ENDPOINT = '/auth/refresh';

const mutex = new Mutex();
let csrfToken: string | null = null;

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (csrfToken) headers.set('x-csrf-token', csrfToken);
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  // Wait until the mutex is available without locking it
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  const getCsrf = async () => {
    const res = await baseQuery({ url: CSRF_ENDPOINT, credentials: 'include' }, api, extraOptions);
    csrfToken = (res.data as any)?.csrfToken || null;
  };

  // handle expired access token
  if (result.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        let refresh = await baseQuery(
          { url: REFRESH_ENDPOINT, method: 'POST', credentials: 'include' },
          api,
          extraOptions,
        );

        // retry refresh if CSRF failed
        if (refresh.error?.status === 403) {
          await getCsrf();
          refresh = await baseQuery(
            { url: REFRESH_ENDPOINT, method: 'POST', credentials: 'include' },
            api,
            extraOptions,
          );
        }

        if (refresh.data) {
          const token = (refresh.data as any)?.data?.accessToken;
          if (token) api.dispatch(setAccessToken(token));
        } else if (refresh.error?.status === 401) {
          api.dispatch(logout());
        }
      } finally {
        release();
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock();
    }

    // retry the initial query
    result = await baseQuery(args, api, extraOptions);
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    'User',
    'Recipe',
    'RecipeDetails',
    'Saved',
    'Ingrediant',
    'RecipeRate',
    'Meal',
    'MealPlan',
    'MealPlannerTemplate',
    'Food',
    'Fruit',
    'UserList',
    'ListDetails',
    'Category',
    'Goal',
    'GeneratedPlan',
    'Package',
    'Order',
    'Subscription',
    'PaymentMethods',
  ],
  endpoints: () => ({}),
});
