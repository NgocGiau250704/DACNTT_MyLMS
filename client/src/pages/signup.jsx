// src/pages/Auth/Signup.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegisterUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Signup = () => {
  const [signupInput, setSignupInput] = useState({ name: "", email: "", password: "" });
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const navigate = useNavigate();

  const changeInputHandler = (e) => {
    const { name, value } = e.target;
    setSignupInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupInput;

    if (!name || !email || !password) {
      toast.warning("All fields are required");
      return;
    }

    try {
      const result = await registerUser(signupInput);
      if (result.data?.success) {
        toast.success(result.data.message || "Signup successful!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(result.error?.data?.message || "Signup failed");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-black">
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
              onChange={changeInputHandler}
              placeholder="Eg. Sakura"
              className="text-black placeholder:text-gray-600 border-gray-400 focus:border-black"
            />

            <Label htmlFor="email" className="text-black">Email</Label>
            <Input
              name="email"
              type="email"
              value={signupInput.email}
              onChange={changeInputHandler}
              placeholder="Eg. sakura@gmail.com"
              className="text-black placeholder:text-gray-600 border-gray-400 focus:border-black"
            />

            <Label htmlFor="password" className="text-black">Password</Label>
            <Input
              name="password"
              type="password"
              value={signupInput.password}
              onChange={changeInputHandler}
              placeholder="Your password"
              className="text-black placeholder:text-gray-600 border-gray-400 focus:border-black"
            />
          </CardContent>

          <CardFooter className="pt-4 flex flex-col gap-3">
            <Button
              disabled={isLoading}
              onClick={handleSignup}
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </>
              ) : (
                "Signup"
              )}
            </Button>

            <p className="text-center text-sm text-gray-700">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-700 font-medium hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
