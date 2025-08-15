export const isAdminLoggedIn = () => {
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");
  return !!token && email === "admin@test.com";
};
