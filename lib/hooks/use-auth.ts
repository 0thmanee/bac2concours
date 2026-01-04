import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { getDefaultDashboard, AUTH_ROUTES, STUDENT_ROUTES } from "@/lib/routes";
import { USER_ROLE, USER_STATUS, API_ROUTES } from "@/lib/constants";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
  type RegisterResponse,
  type VerifyEmailResponse,
  type MessageResponse,
} from "@/lib/validations/auth.validation";

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      // Validate on client side
      const validated = loginSchema.parse(credentials);

      // Try to sign in
      const result = await signIn("credentials", {
        email: validated.email,
        password: validated.password,
        redirect: false,
      });

      // Check for errors
      if (result?.error) {
        // NextAuth v5 wraps errors from authorize() in CallbackRouteError
        // The actual error message is in the server logs, not client-side
        // "Configuration" error means authorize() failed (threw error or returned null)

        // To detect EMAIL_NOT_VERIFIED, we need to check if the user exists but email is unverified
        // We'll make an API call to check this (with password to verify credentials)
        try {
          const checkResponse = await fetch(
            API_ROUTES.AUTH_CHECK_EMAIL_VERIFICATION,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: validated.email,
                password: validated.password,
              }),
            }
          );

          if (checkResponse.ok) {
            const checkData = await checkResponse.json();
            if (checkData.unverified === true) {
              const error = new Error("EMAIL_NOT_VERIFIED") as Error & {
                email: string;
              };
              error.email = validated.email;
              throw error; // This will be caught by the outer catch, not the inner one
            }
          }
        } catch (checkError) {
          // Re-throw EMAIL_NOT_VERIFIED errors so they propagate to the form handler
          if (
            checkError instanceof Error &&
            checkError.message === "EMAIL_NOT_VERIFIED"
          ) {
            throw checkError;
          }
          // For other errors (network, etc.), fall through to generic error
        }

        // Generic error for invalid credentials or other issues
        throw new Error("Invalid email or password");
      }

      if (!result?.ok) {
        throw new Error("Login failed. Please try again.");
      }

      // Fetch session to get user data
      const response = await fetch(API_ROUTES.AUTH_SESSION);
      const session = await response.json();

      if (!session?.user) {
        throw new Error("Failed to create session. Please try again.");
      }

      // Final check: if user somehow got through but email is not verified
      if (!session.user.emailVerified) {
        const error = new Error("EMAIL_NOT_VERIFIED") as Error & {
          email: string;
        };
        error.email = validated.email;
        throw error;
      }

      return { session, email: validated.email };
    },
    onSuccess: async (data) => {
      // Invalidate all queries on successful login
      queryClient.invalidateQueries();
      toast.success("Welcome back!");

      // For students, check if they have approved payment
      // If inactive or no approved payment, redirect to pending page
      if (data.session.user.role === USER_ROLE.STUDENT) {
        // If inactive, redirect to pending page
        if (data.session.user.status === USER_STATUS.INACTIVE) {
          router.push(STUDENT_ROUTES.PENDING);
          router.refresh();
          return;
        }

        // Payment status will be handled by the layout
      }

      // Redirect to role-specific dashboard
      const dashboardUrl = getDefaultDashboard(data.session.user.role);
      router.push(dashboardUrl);
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error && error.message === "EMAIL_NOT_VERIFIED"
          ? "Your email is not verified. Please check your inbox or resend the verification email."
          : error instanceof Error
          ? error.message
          : "Login failed"
      );
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      // Validate on client side
      const validated = registerSchema.parse(data);

      const response = await apiClient.post<RegisterResponse>(
        API_ROUTES.AUTH_REGISTER,
        validated
      );
      // Return both response and credentials for potential auto-login
      return { response, credentials: validated };
    },
    onSuccess: async ({ response, credentials }) => {
      // If this is the first user (admin), they're auto-verified
      // Automatically log them in and redirect to dashboard
      if (response.requiresVerification === false && response.user) {
        // Auto-login the admin user with the credentials they just provided
        const loginResult = await signIn("credentials", {
          email: credentials.email,
          password: credentials.password,
          redirect: false,
        });

        if (loginResult?.ok) {
          queryClient.invalidateQueries();
          toast.success("Compte admin créé ! Bienvenue sur 2BAConcours.");
          // Redirect to admin dashboard - role should be ADMIN for first user
          const dashboardUrl = getDefaultDashboard(
            response.user.role === USER_ROLE.ADMIN
              ? USER_ROLE.ADMIN
              : USER_ROLE.STUDENT
          );
          router.push(dashboardUrl);
          router.refresh();
        } else {
          // If auto-login fails, redirect to login page with success message
          toast.success(
            response.message || "Admin account created! Please sign in."
          );
          router.push(AUTH_ROUTES.LOGIN);
        }
      }
      // For other users, the component will handle showing verification message
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await signOut({ redirect: false });
    },
    onSuccess: () => {
      // Clear all cache on logout
      queryClient.clear();
      router.push(AUTH_ROUTES.LOGIN);
      router.refresh();
    },
  });
}

export function useVerifyEmail() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await apiClient.post<VerifyEmailResponse>(
        API_ROUTES.AUTH_VERIFY_EMAIL,
        { token }
      );
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setTimeout(() => {
        router.push(AUTH_ROUTES.LOGIN);
      }, 3000);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.post<MessageResponse>(
        API_ROUTES.AUTH_FORGOT_PASSWORD,
        { email }
      );
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const response = await apiClient.post<MessageResponse>(
        API_ROUTES.AUTH_RESET_PASSWORD,
        { token: data.token, password: data.password }
      );
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setTimeout(() => {
        router.push(AUTH_ROUTES.LOGIN);
      }, 2000);
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.post<MessageResponse>(
        API_ROUTES.AUTH_RESEND_VERIFICATION,
        { email }
      );
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
  });
}
