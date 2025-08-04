import { cn } from "@/lib/utils";
import UserAuthForm from "./user-auth-form";

export default function SignInViewPage() {
  return (
    <div className="relative h-screen flex items-center justify-center">
      {/* Background effects */}
      <div
        className="absolute inset-0
                    bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]
                    from-orange-50 via-amber-50 to-orange-100
                    dark:from-orange-900 dark:via-amber-900 dark:to-orange-800
                    transition-all duration-300"
      ></div>

      {/* Main container */}
      <div className="relative w-full px-4 sm:px-6 lg:px-8 max-w-lg mx-auto">
        {/* Glass card container */}
        <div
          className={cn(
            // Base styles
            "relative overflow-hidden",
            "p-4 sm:p-6 lg:p-8 rounded-3xl",
            // Background and border
            "bg-white dark:bg-zinc-900",
            "border border-orange-200 dark:border-orange-700",
            // Shadow effects
            "shadow-lg dark:shadow-2xl-dark",
            // Transitions
            "transition-all duration-300",
          )}
        >
          {/* Welcome text */}
          <div className="space-y-2 text-center mb-6 lg:mb-8">
            <h1
              className="text-2xl lg:text-3xl font-semibold tracking-tight
                         text-gray-900 dark:text-gray-100"
            >
              Chào mừng trở lại!
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Đăng nhập để tiếp tục vào dashboard
            </p>
          </div>

          {/* Auth form */}
          <div className="space-y-6">
            <UserAuthForm />
          </div>
        </div>

        {/* Terms and privacy links */}
        <div className="mt-6 text-center space-y-2 text-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Bằng việc tiếp tục, bạn đồng ý với{" "}
            <a
              href="#"
              className="underline hover:text-orange-600
                                 dark:hover:text-orange-400
                                 transition-colors duration-200"
            >
              Điều khoản
            </a>{" "}
            và{" "}
            <a
              href="#"
              className="underline hover:text-orange-600
                                 dark:hover:text-orange-400
                                 transition-colors duration-200"
            >
              Chính sách bảo mật
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
