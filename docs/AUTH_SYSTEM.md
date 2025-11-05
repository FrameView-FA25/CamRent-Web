# 🔐 CamRent Authentication System

## Tổng Quan

Hệ thống authentication được refactor theo cách của Mirava - đơn giản, rõ ràng và dễ maintain.

## 🎯 Luồng Đăng Nhập

```
1. User nhập email/password → ModalLogin
2. authService.login() → API call
3. API response → authService.saveAuthData() tự động lưu localStorage
4. Modal đóng → handleLoginSuccess()
5. refreshAuth() → Update useAuth state
6. navigate(defaultRoute) → Chuyển đến dashboard
7. ProtectedRoute check → Cho phép truy cập
```

## 📦 LocalStorage Structure

| Key          | Value                 | Example              |
| ------------ | --------------------- | -------------------- |
| accessToken  | JWT token             | "eyJhbGciOi..."      |
| refreshToken | Refresh token         | "..."                |
| role         | Role chính của user   | "Owner" hoặc "Admin" |
| userInfo     | Thông tin user (JSON) | {"email":...}        |

### UserInfo Object:

```json
{
  "email": "admin@gmail.com",
  "fullName": "admin",
  "roles": ["Owner"]
}
```

## 🔧 API Endpoint

```
POST https://camrent-backend.up.railway.app/api/Auths/Login

Request:
{
  "email": "admin@gmail.com",
  "password": "123456"
}

Response:
{
  "token": "eyJhbGciOi...",
  "refreshToken": "...",
  "expiresAt": "2025-11-05T03:30:08.0585578Z",
  "fullName": "admin",
  "email": "admin@gmail.com",
  "roles": ["Owner"]
}
```

## 📁 Cấu Trúc Files

```
src/
├── services/
│   └── auth.service.ts           # API calls & localStorage
├── hooks/
│   └── useAuth.ts                # Auth state management
├── components/
│   ├── ProtectedRoute.tsx        # Route protection
│   └── Modal/
│       └── ModalLogin.tsx        # Login modal
├── utils/
│   ├── decodeToken.ts            # JWT decoder
│   └── roleUtils.ts              # Role-based routing
└── layouts/
    └── MainLayout.tsx            # Login handler
```

## 💻 Sử Dụng

### 1. Check Auth State

```typescript
import { useAuth } from "@/hooks/useAuth";

const { user, isAuthenticated, isAdmin, isOwner } = useAuth();

if (isOwner) {
  // Owner logic
}
```

### 2. Protected Routes

```typescript
<Route
  path="/owner"
  element={
    <ProtectedRoute requiredRole="Owner">
      <OwnerLayout />
    </ProtectedRoute>
  }
/>
```

### 3. Logout

```typescript
const { logout } = useAuth();

const handleLogout = () => {
  logout();
  navigate("/");
};
```

### 4. Get User Info

```typescript
const { user } = useAuth();

console.log(user?.fullName); // "admin"
console.log(user?.email); // "admin@gmail.com"
console.log(user?.roles); // ["Owner"]
```

## 🛡️ ProtectedRoute Logic

```typescript
1. Check accessToken trong localStorage
2. Nếu không có → Redirect to "/"
3. Nếu có requiredRole:
   - Check role trong localStorage
   - Nếu không khớp → Decode token để verify
   - Nếu vẫn không khớp → Redirect to "/"
4. ✅ Cho phép truy cập
```

## 🔄 Refactor Changes

### Trước (Phức tạp):

- ❌ Nhiều log statements
- ❌ Nhiều fields trong localStorage (token, expiresAt, userEmail, userFullName, userRoles)
- ❌ Check expiry date phức tạp
- ❌ Race condition giữa navigate và auth update

### Sau (Đơn giản):

- ✅ Ít log hơn, chỉ log cần thiết
- ✅ 4 fields chính: accessToken, refreshToken, role, userInfo
- ✅ Simple check: có token = authenticated
- ✅ ProtectedRoute check localStorage trực tiếp

## 🎨 Role Mapping

```typescript
Admin  → /admin/dashboard  → /admin/profile
Owner  → /owner/dashboard  → /owner/profile
Other  → /                 → /
```

## ✨ Features

- ✅ Đơn giản và dễ hiểu
- ✅ Theo chuẩn của Mirava
- ✅ Không có race condition
- ✅ Token-based authentication
- ✅ Role-based access control
- ✅ Auto-redirect sau login
- ✅ Protected routes
- ✅ User menu với profile & logout

## 🧪 Test Account

```
Email: admin@gmail.com
Password: 123456
Role: Owner
Expected: /owner/dashboard
```

## 📝 Code Examples

### authService

```typescript
// Login
const response = await authService.login({ email, password });

// Check auth
const isAuth = authService.isAuthenticated();

// Get user info
const userInfo = authService.getUserInfo();

// Logout
authService.logout();
```

### useAuth Hook

```typescript
const {
  user, // User object hoặc null
  isAuthenticated, // boolean
  isAdmin, // boolean
  isOwner, // boolean
  loading, // boolean
  logout, // function
  refreshAuth, // function
  checkAuthStatus, // function
} = useAuth();
```

---

**Version:** 2.0.0 (Refactored theo Mirava)  
**Date:** November 5, 2025
