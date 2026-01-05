import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const submissionApi = createApi({
  reducerPath: "submissionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/api/v1/submission",
    credentials: "include", 
  }),
  
  tagTypes: ["Submission"],

  endpoints: (builder) => ({

    submitAssignment: builder.mutation({
      query: ({ assignmentId, formData }) => ({
        url: `/${assignmentId}`,
        method: "POST",
        body: formData, 
      }),
      invalidatesTags: (result, error, { assignmentId }) => [
        { type: "Submission", id: assignmentId },
      ],
    }),

    getMySubmission: builder.query({
      query: (assignmentId) => `/${assignmentId}/me`,
      providesTags: (result, error, assignmentId) => [
        { type: "Submission", id: assignmentId },
      ],
    }),

    getSubmissionsByAssignment: builder.query({
      query: (assignmentId) => `/assignment/${assignmentId}`,
      providesTags: ["Submission"],
    }),

    gradeSubmission: builder.mutation({
      query: ({ submissionId, score, feedback }) => ({
        url: `/${submissionId}/grade`,
        method: "POST",
        body: { score, feedback },
      }),
      invalidatesTags: ["Submission"],
    }),
    
  }),
});

export const {
  useSubmitAssignmentMutation,
  useGetMySubmissionQuery,
  useGetSubmissionsByAssignmentQuery,
  useGradeSubmissionMutation,
} = submissionApi;
