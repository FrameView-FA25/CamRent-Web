# 🔐 Authentication & Role-Based Navigation

## Tổng Quan

Hệ thống đăng nhập tự động điều hướng người dùng đến trang tương ứng với role của họ sau khi login thành công.

## 📊 Luồng Hoạt Động

```
User Login → API Call → Save Auth Data → Check Role → Navigate to Dashboard
```

## 🎯 Role Mapping

| Role    | Dashboard Route    | Profile Route    |
| ------- | ------------------ | ---------------- |
| Admin   | `/admin/dashboard` | `/admin/profile` |
| Owner   | `/owner/dashboard` | `/owner/profile` |
| Default | `/` (Home)         | `/`              |

## 🚀 Quick Start

### 1. Test Login

```
Email: admin@gmail.com
Password: 123456
Role: Owner
Expected: Redirect to /owner/dashboard
```

### 2. Kiểm tra Authentication

```typescript
import { useAuth } from "@/hooks/useAuth";

const { isAuthenticated, user } = useAuth();
console.log(user?.roles); // ["Owner"] hoặc ["Admin"]
```

### 3. Debug Panel (Development Only)

Thêm vào HomePage để debug:

```typescript
import AuthDebugPanel from "@/components/AuthDebugPanel";

<AuthDebugPanel />;
```

## 📁 Cấu Trúc Files

```
src/
├── services/
│   └── auth.service.ts          # API calls & localStorage management
├── hooks/
│   └── useAuth.ts               # Custom hook cho auth state
├── components/
│   ├── ProtectedRoute.tsx       # Bảo vệ routes theo role
│   ├── AuthDebugPanel.tsx       # Debug panel (development)
│   └── Modal/
│       └── ModalLogin.tsx       # Login modal với API integration
├── utils/
│   └── roleUtils.ts             # Helper functions cho role logic
├── layouts/
│   └── MainLayout.tsx           # Handle login success & navigation
└── routers/
    └── MainRouter.tsx           # Protected routes configuration
```

## 🔧 API Configuration

### Endpoint

```
POST https://camrent-backend.up.railway.app/api/Auths/Login
```

### Request

```json
{
  "email": "admin@gmail.com",
  "password": "123456"
}
```

### Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "...",
  "expiresAt": "2025-11-05T03:30:08.0585578Z",
  "fullName": "admin",
  "email": "admin@gmail.com",
  "roles": ["Owner"]
}
```

## 💾 LocalStorage Data

| Key          | Description                   | Example               |
| ------------ | ----------------------------- | --------------------- |
| token        | JWT access token              | "eyJhbGciOi..."       |
| refreshToken | Token để refresh access token | "..."                 |
| expiresAt    | Thời gian hết hạn             | "2025-11-05T03:30..." |
| userFullName | Tên đầy đủ                    | "admin"               |
| userEmail    | Email                         | "admin@gmail.com"     |
| userRoles    | Danh sách roles (JSON string) | '["Owner"]'           |

## 🛡️ Protected Routes

### Cấu hình trong MainRouter.tsx

```typescript
{
  path: "/owner",
  element: (
    <ProtectedRoute requiredRole="Owner">
      <OwnerLayout />
    </ProtectedRoute>
  )
}
```

### Logic kiểm tra

1. User đã login chưa? → Nếu chưa → Redirect `/`
2. Token còn hiệu lực? → Nếu hết hạn → Redirect `/`
3. User có role yêu cầu? → Nếu không → Redirect `/`
4. ✅ Cho phép truy cập

## 📱 User Experience

### Sau khi login thành công:

1. ✅ Modal đóng lại
2. ✅ Header hiển thị tên user
3. ✅ Auto navigate đến dashboard
4. ✅ Console log thông tin

### Khi logout:

1. ✅ Clear localStorage
2. ✅ Reset auth state
3. ✅ Redirect về trang chủ
4. ✅ Header hiển thị nút LOGIN

## 🧪 Testing

### Test Scenarios

#### ✅ Scenario 1: Login với Owner Account

```
1. Click LOGIN button
2. Enter: admin@gmail.com / 123456
3. Submit
Expected: Navigate to /owner/dashboard
```

#### ✅ Scenario 2: Access Protected Route (No Auth)

```
1. Chưa login
2. Truy cập /owner/dashboard
Expected: Redirect to /
```

#### ✅ Scenario 3: Access Protected Route (Wrong Role)

```
1. Login as Owner
2. Truy cập /admin/dashboard
Expected: Redirect to /
```

## 🐛 Debugging

### Check Auth State

```javascript
// Console
localStorage.getItem("token");
localStorage.getItem("userRoles");
```

### Check Navigation

```javascript
// Trong handleLoginSuccess
console.log("Redirecting user with roles:", roles);
console.log("Target route:", defaultRoute);
```

### Common Issues

#### Issue: Không chuyển trang sau login

**Solution:**

- Check console logs
- Verify localStorage có data
- Check `onLoginSuccess` callback được gọi

#### Issue: Bị redirect về trang chủ

**Solution:**

- Check token expiry
- Verify role trong localStorage
- Check ProtectedRoute logic

## 📚 Documentation

- [Login Flow Details](./docs/LOGIN_FLOW.md)
- [Test Guide](./docs/TEST_LOGIN.md)
- [API Documentation](API_DOCS.md)

## 🔗 Related Functions

### Helper Functions

```typescript
// Get default route by role
getDefaultRouteByRole(roles: string[]): string

// Get profile route by role
getProfileRouteByRole(roles: string[]): string

// Check if user has role
hasRole(roles: string[], role: string): boolean
```

### Auth Service

```typescript
// Login
authService.login(credentials);

// Save auth data
authService.saveAuthData(authData);

// Check authentication
authService.isAuthenticated();

// Logout
authService.logout();
```

## ✨ Features

- ✅ Auto-redirect based on role
- ✅ Protected routes with role checking
- ✅ Persistent authentication (localStorage)
- ✅ Token expiration handling
- ✅ User menu with profile & logout
- ✅ Loading states
- ✅ Error handling
- ✅ Debug panel for development

## 🎨 UI Components

### Login Modal

- Email input
- Password input (show/hide)
- Loading spinner
- Error alerts
- Switch to register

### User Menu

- User name display
- Profile navigation
- Logout action
- Dropdown menu

---

**Created:** November 5, 2025  
**Last Updated:** November 5, 2025  
**Version:** 1.0.0
