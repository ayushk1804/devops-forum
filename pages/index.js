import Head from "next/head";
import Link from 'next/link'
import { useAuthDispatch, useAuthState } from "../src/Context/auth";

export default function IndexPage() {
  const { isAuthenticated, user } = useAuthState();
  const { logout } = useAuthDispatch();
  return isAuthenticated ? (
    <>
      <p>{`Hello ${user.name}`}</p>
      <button onClick={() => logout()}>{"LogOut"}</button>
    </>
  ) : (
    <>
      <Link href="/auth/login">Login</Link>
      <Link href="/auth/register">Register</Link>
    </>
  );
}
