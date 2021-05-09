import Head from "next/head";
import { useAuthState } from "../src/Context/auth";

export default function IndexPage() {
  const { isAuthenticated } = useAuthState();
  return isAuthenticated ? "Hello User" : "Hello Guest";
}
