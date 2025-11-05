# Hướng Dẫn Chức Năng Đăng Nhập & Điều Hướng Theo Role

## 🎯 Mục Đích

Sau khi đăng nhập thành công, hệ thống sẽ tự động điều hướng người dùng đến trang tương ứng với role của họ.

## 📋 Luồng Hoạt Động

### 1. Người dùng nhập thông tin đăng nhập

- Email: `admin@gmail.com`
- Password: `123456`

### 2. Hệ thống xác thực

- Gọi API: `POST /api/Auths/Login`
- Nhận response chứa thông tin user và roles

### 3. Lưu thông tin vào LocalStorage

```javascript
{
  token: "JWT_TOKEN",
  refreshToken: "REFRESH_TOKEN",
  expiresAt: "2025-11-05T03:30:08Z",
  userEmail: "admin@gmail.com",
  userFullName: "admin",
  userRoles: ["Owner"]  // hoặc ["Admin"]
}
```

### 4. Điều hướng tự động theo Role

#### Nếu Role = "Admin"

```
→ Chuyển đến: /admin/dashboard
```

#### Nếu Role = "Owner"

```
→ Chuyển đến: /owner/dashboard
```

#### Nếu không có role đặc biệt

```
→ Ở lại: / (trang chủ)
```

## 🔧 Các Component Liên Quan

### 1. `ModalLogin.tsx`

- Xử lý form đăng nhập
- Gọi API và lưu dữ liệu
- Trigger callback `onLoginSuccess` sau khi thành công

### 2. `MainLayout.tsx`

- Nhận callback từ ModalLogin
- Đọc roles từ localStorage
- Điều hướng user đến đúng trang

### 3. `roleUtils.ts`

- Helper functions để xác định route dựa trên role
- `getDefaultRouteByRole(roles)` - Route mặc định
- `getProfileRouteByRole(roles)` - Route profile
- `hasRole(roles, role)` - Kiểm tra role

### 4. `ProtectedRoute.tsx`

- Bảo vệ các route yêu cầu authentication
- Kiểm tra role trước khi cho phép truy cập

## 📝 Code Example

### Sử dụng trong Component

```typescript
import { useAuth } from "@/hooks/useAuth";
import { getDefaultRouteByRole } from "@/utils/roleUtils";

const MyComponent = () => {
  const { user, isAuthenticated } = useAuth();

  const handleGoToDashboard = () => {
    if (user) {
      const route = getDefaultRouteByRole(user.roles);
      navigate(route);
    }
  };

  return <button onClick={handleGoToDashboard}>Go to Dashboard</button>;
};
```

## 🔐 Bảo Vệ Routes

Trong `MainRouter.tsx`:

```typescript
{
  path: "/admin",
  element: (
    <ProtectedRoute requiredRole="Admin">
      <AdminLayout />
    </ProtectedRoute>
  ),
  children: [...]
}
```

## 🧪 Test Cases

### Case 1: Login với Admin Account

1. Nhập email/password của Admin
2. Click "Login"
3. ✅ Kết quả: Chuyển đến `/admin/dashboard`

### Case 2: Login với Owner Account

1. Nhập email/password của Owner
2. Click "Login"
3. ✅ Kết quả: Chuyển đến `/owner/dashboard`

### Case 3: Truy cập route không có quyền

1. Login với Owner account
2. Thử truy cập `/admin/dashboard`
3. ✅ Kết quả: Redirect về trang chủ `/`

## 🎨 User Experience Flow

```
┌─────────────────┐
│  Click LOGIN    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Nhập Email &   │
│  Password       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Submit Form    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Call       │
│  /Auths/Login   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save to        │
│  LocalStorage   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Check Role     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│ Admin │ │ Owner │
│/admin │ │/owner │
│/dash  │ │/dash  │
└───────┘ └───────┘
```

## 🛠️ Troubleshooting

### Vấn đề: Sau khi login không chuyển trang

**Giải pháp:**

1. Mở Console (F12)
2. Kiểm tra log "Redirecting user with roles:"
3. Xác nhận roles có trong localStorage:
   ```javascript
   localStorage.getItem("userRoles");
   ```

### Vấn đề: Bị redirect về trang chủ khi vào admin/owner

**Giải pháp:**

1. Kiểm tra token còn hiệu lực:
   ```javascript
   authService.isAuthenticated();
   ```
2. Kiểm tra role mapping đúng:
   ```javascript
   JSON.parse(localStorage.getItem("userRoles"));
   ```

## 📚 Tham Khảo

- Auth Service: `src/services/auth.service.ts`
- Role Utils: `src/utils/roleUtils.ts`
- Protected Route: `src/components/ProtectedRoute.tsx`
- Main Router: `src/routers/MainRouter.tsx`
