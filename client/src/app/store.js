import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice.js";
import { authApi } from "@/features/api/authApi.js";
import { courseApi } from "@/features/api/courseApi.js";
import { reviewApi } from "@/features/api/reviewApi";
import {purchaseApi} from "@/features/api/purchaseApi.js";
import { courseProgressApi } from "@/features/api/courseProgressApi.js";
import { assignmentApi } from "@/features/api/assignmentApi";
import { submissionApi } from "@/features/api/submissionApi";
import { instructorApi } from "@/features/api/instructorApi.js";
import {chatApi} from "@/features/api/chatApi.js";

const appStore = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [purchaseApi.reducerPath]: purchaseApi.reducer,
    [courseProgressApi.reducerPath]: courseProgressApi.reducer,
    [assignmentApi.reducerPath]: assignmentApi.reducer,
    [submissionApi.reducerPath]: submissionApi.reducer,
    [instructorApi.reducerPath]: instructorApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, courseApi.middleware, reviewApi.middleware, purchaseApi.middleware, courseProgressApi.middleware, assignmentApi.middleware, submissionApi.middleware, instructorApi.middleware, chatApi.middleware),
});

export default appStore;

const initializeApp = async () => {
  await appStore.dispatch(authApi.endpoints.loadUser.initiate({}, { forceRefetch: true }));
};
 