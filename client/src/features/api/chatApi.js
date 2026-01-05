import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/api/v1", // ✅ SỬA Ở ĐÂY
    credentials: "include",
  }),
  endpoints: (builder) => ({
    chatWithGemini: builder.mutation({
      query: (message) => ({
        url: "/chat",
        method: "POST",
        body: { message },
      }),
    }),
  }),
});

export const { useChatWithGeminiMutation } = chatApi;
