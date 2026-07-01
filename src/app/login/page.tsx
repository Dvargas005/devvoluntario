import LoginForm from "./LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const callbackUrl = searchParams.callbackUrl || "/";

  return <LoginForm callbackUrl={callbackUrl} />;
}
