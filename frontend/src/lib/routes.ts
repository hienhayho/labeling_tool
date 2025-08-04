// Route configuration
export const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/auth/callback",
  "/google-callback",
];

export const isPublicRoute = (pathname: string): boolean => {
  // Remove locale prefix if present
  const pathWithoutLocale = pathname.replace(/^\/(vi|en|ja|zh|fr)/, "") || "/";

  // Check if the path (without locale) is in public routes
  return publicRoutes.includes(pathWithoutLocale);
};

export const isPrivateRoute = (pathname: string): boolean => {
  return !isPublicRoute(pathname);
};
