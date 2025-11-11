# 📝 Form Tạo Camera - Ví dụ

## ✅ Đã cập nhật form theo API

### Form chỉ có 6 trường:

```typescript
{
  brand: string; // Thương hiệu
  model: string; // Model
  variant: string; // Phiên bản
  serialNumber: string; // Số serial
  estimatedValueVnd: number; // Giá trị ước tính
  specsJson: string; // Thông số kỹ thuật
}
```

## 🧪 Ví dụ test

### Ví dụ 1: Canon R5

```json
{
  "brand": "Canon",
  "model": "R5",
  "variant": "Body Only",
  "serialNumber": "SN001",
  "estimatedValueVnd": 80000000,
  "specsJson": "Full-frame 45MP, 8K video"
}
```

### Ví dụ 2: Sony Alpha A7 IV

```json
{
  "brand": "Sony",
  "model": "Alpha A7 IV",
  "variant": "Kit 24-70mm",
  "serialNumber": "SN002",
  "estimatedValueVnd": 65000000,
  "specsJson": "Full-frame 33MP, 4K 60fps, 5-axis IBIS"
}
```

### Ví dụ 3: Simple test

```json
{
  "brand": "Canon",
  "model": "Alpa",
  "variant": "a",
  "serialNumber": "a",
  "estimatedValueVnd": 22,
  "specsJson": "sendo"
}
```

## 📋 Các trường trong form:

| Trường            | Bắt buộc | Kiểu     | Mô tả                                                   |
| ----------------- | -------- | -------- | ------------------------------------------------------- |
| Thương hiệu       | ✅       | Select   | Canon, Sony, Nikon, Fujifilm, Panasonic, Olympus, Leica |
| Model             | ✅       | Text     | Tên model camera                                        |
| Phiên bản         | ✅       | Text     | Body Only, Kit, v.v.                                    |
| Số Serial         | ✅       | Text     | Số serial duy nhất                                      |
| Giá trị ước tính  | ✅       | Number   | Giá trị camera (VNĐ)                                    |
| Thông số kỹ thuật | ⭕       | Textarea | Mô tả thông số (optional)                               |

## 🎨 Giao diện form:

```
┌──────────────────────────────────────────┐
│  Thêm Camera mới                    [X]  │
├──────────────────────────────────────────┤
│                                          │
│  Thương hiệu *     │  Model *            │
│  [Canon      ▼]    │  [R5              ] │
│                                          │
│  Phiên bản *       │  Số Serial *        │
│  [Body Only    ]   │  [SN001           ] │
│                                          │
│  Giá trị ước tính *                      │
│  [₫ 80000000                          ]  │
│                                          │
│  Thông số kỹ thuật                       │
│  ┌────────────────────────────────────┐  │
│  │ Full-frame 45MP, 8K video          │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
├──────────────────────────────────────────┤
│              [Hủy]  [Thêm Camera]        │
└──────────────────────────────────────────┘
```

## ✅ Validation:

- ✅ Tất cả trường bắt buộc phải được điền
- ✅ Giá trị ước tính phải > 0
- ✅ Hiển thị thông báo lỗi rõ ràng cho từng trường

## 🚀 Test ngay:

1. Đăng nhập với tài khoản Owner
2. Vào trang **Products** (Camera Management)
3. Click **"Thêm Camera mới"**
4. Điền thông tin:
   - Thương hiệu: Canon
   - Model: Alpa
   - Phiên bản: a
   - Serial: a
   - Giá trị: 22
   - Thông số: sendo
5. Click **"Thêm Camera"**
6. Xem camera mới xuất hiện trong danh sách! ✨
