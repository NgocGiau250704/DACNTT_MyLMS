import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const assignmentApi = createApi({
  reducerPath: "assignmentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/api/v1/assignment",
    credentials: "include",
  }),
  tagTypes: ["Assignment"],
  endpoints: (builder) => ({

    
    uploadAssignmentFile: builder.mutation({
      query: (formData) => ({
        url: "/upload",
        method: "POST",
        body: formData,
      }),
    }),

    
    createAssignment: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Assignment"],
    }),

    
    getAssignmentsByLecture: builder.query({
      query: (lectureId) => `/lecture/${lectureId}`,
      providesTags: ["Assignment"],
    }),

    
    updateAssignment: builder.mutation({
      query: ({ assignmentId, ...data }) => ({
        url: `/${assignmentId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Assignment"],
    }),

    
    deleteAssignment: builder.mutation({
      query: (assignmentId) => ({
        url: `/${assignmentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assignment"],
    }),

    getAssignmentsForInstructor: builder.query({
      query: () => "/instructor",
      providesTags: ["Assignment"],
    }),
  }),
});

export const {
  useUploadAssignmentFileMutation,
  useCreateAssignmentMutation,
  useGetAssignmentsByLectureQuery,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetAssignmentsForInstructorQuery,
} = assignmentApi;
