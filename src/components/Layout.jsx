import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full pt-12">{children}</main>
    </>
  );
}
