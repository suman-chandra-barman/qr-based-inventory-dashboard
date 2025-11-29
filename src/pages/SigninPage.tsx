/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router";
import signinImage from "@/assets/signin.png";

// RTK Query & Redux

import { useDispatch } from "react-redux";
import { setUser } from "@/redux/features/auth/authSlice";
import { useUserLoginMutation } from "@/redux/api/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getErrorMessage } from "@/lib/utils";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

type TSignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // RTK Query Login Mutation
  const [userLogin, { isLoading, error }] = useUserLoginMutation();

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: TSignInFormData) => {
    try {
      const res = await userLogin({
        email: data.email,
        password: data.password,
      }).unwrap();

      // Extract token - check if it's accessToken or token
      const token = res.data?.accessToken || res.data?.token;
      const refreshToken = res.data?.refreshToken;

      // Save user & token in Redux
      dispatch(
        setUser({
          user: res.data.user,
          token: token,
          refreshToken: refreshToken,
        })
      );

      toast.success("Login successful!");
      form.reset();

      navigate("/dashboard");
    } catch (error) {
      // Error is handled by the error state
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div>
          <img
            src={signinImage}
            alt="Shopping illustration"
            className="max-w-xl h-auto"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Sign In</h1>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{getErrorMessage(error)}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your email..."
                            className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-full focus:bg-white"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter Password"
                            className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 rounded-full focus:bg-white"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-auto p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Forgot */}
                <div>
                  <Link to="/forgot-password">
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-blue-600 hover:text-blue-700"
                    >
                      Forgot password?
                    </Button>
                  </Link>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
