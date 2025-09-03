// import cookie from "cookie";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Socket, DefaultEventsMap } from "socket.io";
import { JWT_SECRET } from "@chess/backend-common/config";

export const authenticated = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  try {
    const rawCookies = socket.handshake.headers.cookie || "";
    const cookies = Object.fromEntries(
      rawCookies.split("; ").map((c) => c.split("="))
    );

    const token = cookies?.chess_authentication_token;

    if (!token) {
      return;
    }
    const decoded =  jwt.verify(token, JWT_SECRET);
    if(typeof decoded === "string") return;

    return decoded?.id;

  } catch (err: any) {
    console.error("Error decoding token:", err?.message);
    socket.disconnect(); 
    return;
  }
};
