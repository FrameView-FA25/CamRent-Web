/**
 * Lấy route mặc định dựa trên role của user
 * @param role - Role của user (Admin, Owner, etc.)
 * @returns Đường dẫn route mặc định
 */
export const getDefaultRouteByRole = (role: string): string => {
  if (role === "Admin") {
    return "/admin/dashboard";
  } else if (role === "Owner") {
    return "/owner/dashboard";
  } else if (role === "Manager") {
    return "/manager/home";
  }
  // Mặc định trả về trang chủ nếu không có role đặc biệt
  return "/";
};

/**
 * Lấy route profile dựa trên role của user
 * @param role - Role của user
 * @returns Đường dẫn đến trang profile
 */
export const getProfileRouteByRole = (role: string): string => {
  if (role === "Admin") {
    return "/admin/profile";
  } else if (role === "Owner") {
    return "/owner/profile";
  }
  return "/";
};
