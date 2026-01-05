import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import {authApi} from "@/features/api/authApi"


const rootReducer = combineReducers({
    auth:authReducer,
    [authApi.reducerPath]:authApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [courseProgressApi.reducerPath]: courseProgressApi.reducer,
    // authApi: authApi.reducer,
    auth:authReducer,

});
export default rootReducer;