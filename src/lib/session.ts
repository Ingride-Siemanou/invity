import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

export type SessionPayload = {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
};

export async function createSessionToken(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);

    return payload as SessionPayload;
  } catch {
    return null;
  }
}