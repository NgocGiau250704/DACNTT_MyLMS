import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
// import { handleSuccess } from '../utils';
import "../index.css";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "https://dacntt-mylms-1.onrender.com/api/v1/user/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || "Reset link sent");
        const msg = "Please check your email for the reset link.";

        navigate("/", { state: { msg } });
      } else {
        toast.error(result.message || "Failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-800">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-semibold mb-2">Forgot Password</h2>

        <p className="text-sm text-gray-500 mb-6">
          Enter your email to receive a reset link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Send reset link
          </button>
        </form>

        <div className="mt-4 text-sm">
          Back to Login{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
