import Head from "next/head";
import { useAuthDispatch, useAuthState } from "../src/Context/auth";

export default function IndexPage() {
  const { isAuthenticated, user } = useAuthState();
  const { login, register, logout } = useAuthDispatch();
  return isAuthenticated ? (
    <>
      <p>{`Hello ${user.name}`}</p>
      <button onClick={() => logout()}>{"LogOut"}</button>
    </>
  ) : (
    <>
      <button
        onClick={() => {
          login({ email: "testuser111@test.com", password: "abc123" });
        }}
      >
        LogIn
      </button>
      <br/>
      <button
        onClick={() =>
          register({
            name: "Test user 1",
            email: "testuser111@test.com",
            password: "abc123",
          })
        }
      >
        Register
      </button>
    </>
  );
}
