import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const instructorApi = createApi({
  reducerPath: "instructorApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://dacntt-mylms-1.onrender.com/api/v1/instructor",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => "/dashboard",
    }),

    getCourseStats: builder.query({
      query: () => "/course-stats",
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetCourseStatsQuery,
} = instructorApi;
