export function decodeToken(token: string) {
  try {
    if (!token) return null;

    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    // console.log("Decoded token payload:", decoded);
    // console.log("UserId:", decoded.userId || decoded.sub || decoded.id);

    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}
