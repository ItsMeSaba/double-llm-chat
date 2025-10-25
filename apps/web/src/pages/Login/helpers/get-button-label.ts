export function getButtonLabel(isLogin: boolean, isLoading: boolean) {
  return isLoading
    ? isLogin
      ? "Signing In..."
      : "Creating Account..."
    : isLogin
      ? "Sign In"
      : "Sign Up";
}
