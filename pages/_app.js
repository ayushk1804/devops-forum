import "tailwindcss/tailwind.css";
import "../src/styles/app.css";
import { AuthProvider } from "../src/Context/auth";

function MyApp({ Component, pageProps }) {
  const Layout = Component.layout || (({ children }) => <>{children}</>);
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;
