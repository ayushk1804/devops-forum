import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Layout } from "../../src/Components/Layout/Layout";
import { useAuthDispatch, useAuthState } from "../../src/Context/auth";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthState();
  const { login: loginUser } = useAuthDispatch();
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  const onSubmit = async ({email, password }) => {
    // 2. Post request to API /api/auth/register
    console.log({email, password });
    try {
      await loginUser({email, password});
    } catch ({ message }) {
      setError("email", {
        type: "manual",
        message,
      });
    }
  };

  const emailRegexPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,}$/i;

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated]);

  return (
    <>
      <h1 className="text-2xl">Login to your account:</h1>
      {/* 1. Form name, email, password */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="">
          <input
            type="text"
            {...register("email", {
              required: "Please provide your email address",
              pattern: {
                message: "Please provide a valid email address",
                value: emailRegexPattern,
              },
            })}
            placeholder="email"
          />
          {errors.email && <span>{errors.email.message}</span>}
          <input
            type="password"
            {...register("password", {
              required: "Please provide your password",
            })}
            placeholder="password"
          />
          {errors.password && <span>{errors.password.message}</span>}
        </div>
        <button type="submit" disabled={isSubmitting}> LogIn </button>
      </form>
    </>
  );
}
LoginPage.layout = Layout

// 2. Post request to API /api/auth/register
// 3. If error return the error
// 4. If successful return home
