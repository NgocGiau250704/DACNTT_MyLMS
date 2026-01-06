//ngocgiau250723_db_user
//ngocgiau52200041

import { AppWindowIcon, CodeIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { Loader2 } from "lucide-react";
// import { toast } from "react-hot-toast";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { userLoggedIn } from "@/features/authSlice";
import {
  useRegisterUserMutation,
  useLoginUserMutation,
} from "@/features/api/authApi";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Login() {
  const [loginInput, setLoginInput] = useState({
    email: "",
    password: "",
  });
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();
  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginUserMutation();

  const navigate = useNavigate();
  const dispatch = useDispatch();


  useEffect(() => {
    if (registerIsSuccess && registerData) {
      toast.success(registerData.message || "Signup successful.");
    }

    if (registerError) {
      const errMsg = registerError?.data?.message || "Signup failed.";
      toast.error(errMsg);
    }
  }, [registerIsSuccess, registerData, registerError]);

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput((prev) => ({ ...prev, [name]: value }));
    } else {
      setLoginInput((prev) => ({ ...prev, [name]: value }));
    }
  };
  console.log("signupInfo ->", signupInput);

  const handleSignup = async (e, type) => {
  e.preventDefault();
  const { name, email, password } = signupInput;
  const inputData = type === "signup" ? signupInput : loginInput;
  const action = type === "signup" ? registerUser : loginUser;
  await action(inputData);

  if (!name || !email || !password) {
    toast.warn(" All fields are required", { position: "top-right" });
    return;
  }

  try {
    const url = "https://dacntt-mylms-1.onrender.com/api/v1/user/register";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json();
    const { success, message, error } = result;

    if (success) {
      toast.success(message || "Signup successful!", {
        position: "bottom-right",
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else if (error) {
      toast.error(
        error.details?.[0]?.message ||
          "Weak password, please try again.",
        { position: "bottom-right" }
      );
    } else {
      toast.error(result.message || "Something went wrong.", {
        position: "bottom-right",
      });
    }
  } catch (err) {
    toast.error(err.message || "Something went wrong.", {
      position: "bottom-right",
    });
  }
};

  const handleLogin = async (e) => {
    e.preventDefault();

    const { email, password } = loginInput;
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    

    try {
      const result = await loginUser(loginInput);

      if (result.data?.success) {
        const res = result.data;
        console.log("LOGIN RESPONSE:", res);

         localStorage.setItem("token", res.token);
        toast.success(res.message || "Welcome back!");
        dispatch(userLoggedIn({ user: res.user }));
        navigate(res.user?.role === "teacher" ? "/homeAdmin" : "/");
        return;
      }

      if (result.error?.data) {
        toast.error(
          result.error.data.message || "Incorrect email or password."
        );
        return;
      }

      toast.error("Something went wrong. Please try again later.");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again later.");
    }
  };

  return (

  <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
    
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-black">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="signup" className="text-black">Signup</TabsTrigger>
          <TabsTrigger value="login" className="text-black">Login</TabsTrigger>
        </TabsList>

        {/* Signup */}
        <TabsContent value="signup">
          <Card className="border-none shadow-none bg-white text-black">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-black">Signup</CardTitle>
              <CardDescription className="text-gray-700">
                Create a new account to start learning
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 text-black">
              <Label htmlFor="name" className="text-black">Name</Label>
              <Input
                name="name"
                type="text"
                value={signupInput.name}
                onChange={(e) => changeInputHandler(e, "signup")}
                placeholder="Eg. Sakura"
                className="text-black placeholder:text-gray-600 border-gray-400 focus:border-black"
              />

              <Label htmlFor="email" className="text-black">Email</Label>
              <Input
                name="email"
                type="email"
                value={signupInput.email}
                onChange={(e) => changeInputHandler(e, "signup")}
                placeholder="Eg. sakura@gmail.com"
                className="text-black placeholder:text-gray-600 border-gray-400 focus:border-black"
              />

              <Label htmlFor="password" className="text-black">Password</Label>
              <Input
                name="password"
                type="password"
                value={signupInput.password}
                onChange={(e) => changeInputHandler(e, "signup")}
                placeholder="Your password"
                className="text-black placeholder:text-gray-600 border-gray-400 focus:border-black"
              />
            </CardContent>

            <CardFooter className="pt-4">
              <Button
                disabled={registerIsLoading}
                onClick={handleSignup}
                className="w-full bg-black hover:bg-gray-800 text-white"
              >
                {registerIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                  </>
                ) : (
                  "Signup"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Login */}
        <TabsContent value="login">
          <Card className="border-none shadow-none bg-white text-black">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-black">Login</CardTitle>
              <CardDescription className="text-gray-700">
                Enter your credentials to continue
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 text-black">
              <Label htmlFor="email" className="text-black">Email</Label>
              <Input
                name="email"
                type="email"
                value={loginInput.email}
                onChange={(e) => changeInputHandler(e, "login")}
                placeholder="Eg. sakura@gmail.com"
                className="text-black placeholder:text-gray-600 border-gray-400 focus:border-black"
              />

              <Label htmlFor="password" className="text-black">Password</Label>
              <Input
                name="password"
                type="password"
                value={loginInput.password}
                onChange={(e) => changeInputHandler(e, "login")}
                placeholder="Eg. x@1"
                className="text-black placeholder:text-gray-600 border-gray-400 focus:border-black"
              />

              <div className="text-sm text-right">
                <a
                  href="/forgotPassword"
                  className="text-indigo-700 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            </CardContent>

            <CardFooter className="pt-4">
              <Button
                disabled={loginIsLoading}
                onClick={handleLogin}
                className="w-full bg-black hover:bg-gray-800 text-white"
              >
                {loginIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>
);



}
export default Login;
