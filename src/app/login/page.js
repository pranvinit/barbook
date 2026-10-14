import SignInForm from "@/features/auth/ui/SignInForm";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage({ searchParams }) {
  const { next, error } = await searchParams;
  return <SignInForm next={next} error={error} />;
}
