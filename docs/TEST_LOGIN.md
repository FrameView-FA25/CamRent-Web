# Test Login Flow

## Hướng dẫn test chức năng đăng nhập và điều hướng theo role

### Bước 1: Chạy ứng dụng

```bash
npm run dev
```

### Bước 2: Mở trình duyệt

Truy cập: `http://localhost:5173`

### Bước 3: Test với Owner Account

1. Click nút **LOGIN** trên header
2. Nhập thông tin:
   - Email: `admin@gmail.com`
   - Password: `123456`
3. Click **Login**
4. ✅ **Kết quả mong đợi**:
   - Modal đóng lại
   - Chuyển hướng đến: `/owner/dashboard`
   - Header hiển thị tên user: "admin"
   - Console log: `Redirecting user with roles: ["Owner"]`

### Bước 4: Kiểm tra LocalStorage

Mở DevTools (F12) → Console → Gõ:

```javascript
// Kiểm tra token
localStorage.getItem("token");

// Kiểm tra user info
localStorage.getItem("userFullName");
localStorage.getItem("userEmail");

// Kiểm tra roles
JSON.parse(localStorage.getItem("userRoles"));
```

### Bước 5: Test Protected Routes

#### Test 1: Truy cập Owner Dashboard (có quyền)

- URL: `/owner/dashboard`
- ✅ Kết quả: Hiển thị trang dashboard

#### Test 2: Truy cập Admin Dashboard (không có quyền)

- URL: `/admin/dashboard`
- ✅ Kết quả: Redirect về trang chủ `/`

### Bước 6: Test User Menu

1. Click vào tên user trên header
2. Dropdown menu hiển thị:
   - Profile
   - Logout
3. Click **Profile**
   - ✅ Chuyển đến: `/owner/profile`
4. Click **Logout**
   - ✅ Xóa thông tin auth
   - ✅ Redirect về trang chủ
   - ✅ Header hiển thị nút LOGIN

### Bước 7: Test Authentication State

```javascript
// Mở Console
import { authService } from "./src/services/auth.service";

// Kiểm tra trạng thái đăng nhập
authService.isAuthenticated(); // true nếu đã login

// Kiểm tra roles
authService.getUserRoles(); // ["Owner"] hoặc ["Admin"]

// Kiểm tra token
authService.getToken(); // JWT token string
```

## Các Trường Hợp Test

### ✅ Test Case 1: Login thành công với Owner

- Input: admin@gmail.com / 123456
- Expected: Redirect to /owner/dashboard
- Status: PASS ✓

### ✅ Test Case 2: Login thất bại (sai password)

- Input: admin@gmail.com / wrongpass
- Expected: Hiển thị error message
- Status: Kiểm tra error handling

### ✅ Test Case 3: Protected Route khi chưa login

- Action: Truy cập /owner/dashboard khi chưa login
- Expected: Redirect to / (home)
- Status: PASS ✓

### ✅ Test Case 4: Protected Route với wrong role

- Action: Owner account cố truy cập /admin/dashboard
- Expected: Redirect to / (home)
- Status: PASS ✓

### ✅ Test Case 5: Logout

- Action: Click logout button
- Expected:
  - Clear localStorage
  - Redirect to /
  - Show LOGIN button
- Status: PASS ✓

## Debug Tips

### Nếu không chuyển trang sau khi login:

1. Kiểm tra Console logs:

```
Login successful: { fullName, email, roles }
Redirecting user with roles: ["Owner"]
```

2. Kiểm tra localStorage:

```javascript
localStorage.getItem("userRoles"); // Phải có giá trị
```

3. Kiểm tra navigate function:

```javascript
// Thêm log trong handleLoginSuccess
console.log("Navigating to:", defaultRoute);
```

### Nếu bị redirect về trang chủ ngay lập tức:

1. Kiểm tra token expiry:

```javascript
new Date(localStorage.getItem("expiresAt")) > new Date();
```

2. Kiểm tra ProtectedRoute:

- Xem file: `src/components/ProtectedRoute.tsx`
- Đảm bảo role checking logic đúng

## Expected Console Output

```
Login successful: {
  fullName: "admin",
  email: "admin@gmail.com",
  roles: ["Owner"]
}

Redirecting user with roles: ["Owner"]

// Sau đó chuyển đến /owner/dashboard
```
