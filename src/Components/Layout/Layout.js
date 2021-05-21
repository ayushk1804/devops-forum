import Link from "next/link";
import { useAuthDispatch, useAuthState } from "../../Context/auth";

const Layout = ({ children }) => {
  const { isAuthenticated, user } = useAuthState();
  const { logout } = useAuthDispatch();
  return (
    <>
      <header className="bg-white py-6 shadow-sm">
        <div className="max-w-4xl mx-auto px-6">
          {isAuthenticated ? (
            <>
              <h1>{`Hello ${user.name}`}</h1>
              <button onClick={() => logout()}>{"LogOut"}</button>
              <Link href="/ask">
                <a>Ask a question</a>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/register">Register</Link>
            </>
          )}
        </div>
      </header>
      <div className="max-w-4xl mx-auto p-6 bg-gray-100">{children}</div>
    </>
  );
};

export { Layout };
