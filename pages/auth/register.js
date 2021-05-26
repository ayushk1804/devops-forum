import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Layout } from "../../src/Components/Layout/Layout";
import { useAuthDispatch, useAuthState } from "../../src/Context/auth";

export default function RegistrationPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthState();
  const { register: createUser } = useAuthDispatch();
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  const onSubmit = async ({ name, email, password }) => {
    // 2. Post request to API /api/auth/register
    console.log({ name, email, password });
    try {
      await createUser({ name, email, password });
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
      <h1 className="">Create an account:</h1>
      {/* 1. Form name, email, password */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="">
          <input
            type="text"
            {...register("name", { required: "Please provide your name" })}
            placeholder="Name"
          />
          {errors.name && <span>{errors.name.message}</span>}
          <input
            type="email"
            {...register("email", {
              required: "Please provide an email address",
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
              required: "Please provide a password",
              minLength: {
                message: "Your password must be at least 6 characters long.",
                value: 6,
              },
            })}
            placeholder="password"
          />
          {errors.password && <span>{errors.password.message}</span>}
        </div>
        <button type="submit" disabled={isSubmitting}>
          {" "}
          Create Account{" "}
        </button>
      </form>
    </>
  );
}

RegistrationPage.layout = Layout;
