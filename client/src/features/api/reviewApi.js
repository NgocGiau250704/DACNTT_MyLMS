// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// const REVIEW_URL = "http://localhost:8080/api/v1/"; 

// export const reviewApi = createApi({
//     reducerPath: "reviewApi", 
    
//     baseQuery: fetchBaseQuery({
//         baseUrl: REVIEW_URL,
//         prepareHeaders: (headers, { getState }) => {
//             const token = getState().auth.token; 
//             console.log("TOKEN FROM REDUX ===>", token);
//             if (token) {
//                 headers.set('Authorization', `Bearer ${token}`);
//             }
//             return headers;
//         },
//     }),
    
//     tagTypes: ["Reviews"],

//     endpoints: (builder) => ({
        
//         getCourseReviews: builder.query({
//             query: (courseId) => `course/${courseId}/reviews`,            
//             providesTags: ["Reviews"],
//         }),

//         createReview: builder.mutation({
//             query: ({ courseId, ...body }) => ({
//                 url: `course/${courseId}/reviews`,
//                 method: 'POST',
//                 body,
//             }),
//             invalidatesTags: ["Reviews"],
//         }),
//     }),
// });

// export const { useGetCourseReviewsQuery, useCreateReviewMutation } = reviewApi;
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const REVIEW_URL = "https://dacntt-mylms-1.onrender.com/api/v1/"; 

export const reviewApi = createApi({
    reducerPath: "reviewApi",

    baseQuery: fetchBaseQuery({
        baseUrl: REVIEW_URL,
        credentials: "include",
    }),

    tagTypes: ["Reviews"],

    endpoints: (builder) => ({
        
        getCourseReviews: builder.query({
            query: (courseId) => `course/${courseId}/reviews`,
            providesTags: ["Reviews"],
        }),

        createReview: builder.mutation({
            query: ({ courseId, ...body }) => ({
                url: `course/${courseId}/reviews`,
                method: "POST",
                body,
                credentials: "include", 
            }),
            invalidatesTags: ["Reviews"],
        }),
    }),
});

export const { useGetCourseReviewsQuery, useCreateReviewMutation } = reviewApi;
