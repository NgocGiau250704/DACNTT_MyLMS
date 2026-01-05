import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../authSlice";
import { userLoggedOut } from "../authSlice";

const USER_API = "http://localhost:8080/api/v1/user/";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (inputData) => ({
        url: "register",
        method: "POST",
        body: inputData,
      }),
    }),
    // loginUser: builder.mutation({
    //   query: (inputData) => ({
    //     url: "login",
    //     method: "POST",
    //     body: inputData,
    //   }),
    //   async onQueryStarted(_, { queryFulfilled, dispatch }) {
    //     try {
    //       const result = await queryFulfilled;
    //       dispatch(userLoggedIn({ user: result.data.user }));
    //     } catch (error) {
    //       console.log(error);
    //     }
    //   },
    // }),

    loginUser: builder.mutation({
      query: (inputData) => ({
        url: "login",
        method: "POST",
        body: inputData,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));

          setTimeout(() => {
            window.location.reload(); 
          }, 300);
        } catch (error) {
          console.log(error);
        }
      },
    }),

    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch }) {
        try {
          dispatch(userLoggedOut());
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },
    }),

    loadUser: builder.query({
      query: () => ({
        url: "profile",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userLoggedIn({ user: data.user }));
          localStorage.setItem("user", JSON.stringify(data.user)); // cập nhật lại nếu hợp lệ
        } catch (error) {
          dispatch(userLoggedOut());
          localStorage.removeItem("user");
        }
      },
    }),

    updateUser: builder.mutation({
      query: (formData) => ({
        url: "profile/update",
        method: "PUT",
        body: formData,
        credentials: "include",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userLoggedIn({ user: data.user }));
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (error) {
          console.error("Update user failed:", error);
        }
      },
    }),
    getAllUsers: builder.query({
      query: () => ({
        url: "/all-users",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLoadUserQuery,
  useLogoutUserMutation,
  useUpdateUserMutation,
  useGetAllUsersQuery,
} = authApi;
