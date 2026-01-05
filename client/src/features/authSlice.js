import { createSlice } from "@reduxjs/toolkit";


const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token"); //mới thêm 9/12

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null, //mới thêm 9/12
  isAuthenticated: !!storedUser,
};
// const initialState = {
//   user: null,
//   isAuthenticated: false,
// };

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token; //mới thêm 9/12

      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token); //mới thêm 9/12
    },
    userLoggedOut: (state) => {
      state.user = null;
      state.token = null; //mới thêm 9/12
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("token"); //mới thêm 9/12
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;

export default authSlice.reducer;
