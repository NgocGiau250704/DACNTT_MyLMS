import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://dacntt-mylms-1.onrender.com/api/v1", 
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
