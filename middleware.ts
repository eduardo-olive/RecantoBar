export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    // Protege apenas paginas, nao APIs nem arquivos estaticos
    "/((?!login|api|_next/static|_next/image|favicon.ico).*)",
  ],
};
