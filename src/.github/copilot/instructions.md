# CAMRENT – COPILOT RULES

## 1. General Behavior Rules

- Luôn trả lời bằng **tiếng Việt**, ngắn gọn, dễ hiểu.
- Luôn ưu tiên **generate code**, không mô tả lý thuyết quá nhiều.
- Khi người dùng hỏi về UI: tạo **component đầy đủ**, không tạo 1 phần lẻ.
- Khi có lỗi: **giải thích đúng lỗi + xuất code đã fix**.

---

## 2. Technology Stack Rules

CamRent sử dụng:

- **React + Vite + TypeScript**
- **Material UI (MUI v5)**
- **Fetch** cho API
- **React Router v6**
- **Cloudinary** cho hình ảnh sản phẩm
- **.NET Web API (C#)** là backend
- Nhiều **actor/role**: Admin, Manager, Staff, Owner, Renter

Tất cả code sinh ra phải tuân thủ **đúng stack trên**.

---

## 3. UI/UX Rules

- Tất cả UI phải dùng **MUI** (Box, Stack, Typography, Card, Button…).
- Không sử dụng Grid nếu người dùng không yêu cầu → thay bằng **Box/Stack**.
- Màu sắc theo CamRent:
  - Chủ đạo: colors.primary.main
  - Secondary: colors.primary.light
- Layout phải clean, hiện đại, spacing rõ ràng.
- Khi thiếu dữ liệu API → phải fallback mặc định.

---

## 4. Coding Standards

- Viết code bằng **TypeScript 100%**.
- Không sử dụng `any` trừ khi thật sự cần thiết.
- Interface đặt trong thư mục `/types`.
- Các biến và hàm dùng **camelCase**.
- Tên component dùng **PascalCase**.
- Tất cả API call phải có:
  - Loading state
  - Error state
  - Empty state
- Luôn viết comment mô tả function:

```ts
/**
 * Fetch camera detail from API by ID
 */
```

## 5. File Structure Rules

src/
components/
pages/
services/
hooks/
theme/
router/
types/
