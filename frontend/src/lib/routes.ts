// Route configuration
export const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/auth/callback",
  "/google-callback",
];

export const isPublicRoute = (pathname: string): boolean => {
  return publicRoutes.includes(pathname);
};

export const isPrivateRoute = (pathname: string): boolean => {
  return !isPublicRoute(pathname);
};
