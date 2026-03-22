export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    // Protege tudo exceto login, api/auth e arquivos estaticos
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
