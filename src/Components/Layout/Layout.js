import Link from "next/link";
import { useAuthDispatch, useAuthState } from "../../Context/auth";

const Layout = ({ children }) => {
  const { isAuthenticated, user } = useAuthState();
  const { logout } = useAuthDispatch();
  return (
    <>
      <header className="bg-white py-6 shadow-sm">
        <div className="max-4-wl mx-auto px-6">
          {isAuthenticated ? (
            <>
              <p>{`Hello ${user.name}`}</p>
              <button onClick={() => logout()}>{"LogOut"}</button>
            </>
          ) : (
            <>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/register">Register</Link>
            </>
          )}
        </div>
      </header>
      <div className="max-4-wl mx-auto p-6 bg-gray-100">{children}</div>
    </>
  );
};

export { Layout };
