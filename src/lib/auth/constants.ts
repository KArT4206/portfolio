// Deliberately dependency-free (no crypto, no Prisma) so Edge middleware can
// import just this constant without pulling in the entire session module.
export const SESSION_COOKIE_NAME = "admin_session";
