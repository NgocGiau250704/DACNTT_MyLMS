// import { createApi } from "@reduxjs/toolkit/query";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const COURSE_PURCHASE_API = "/api/v1/course";

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getCourseById: builder.query({
      query: (id) => `${COURSE_PURCHASE_API}/${id}`,
    }),
  }),
});

export const { useGetCourseByIdQuery } = purchaseApi;
