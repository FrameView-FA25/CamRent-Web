# Wallet Feature - Tính năng Quản lý Ví

## Tổng quan

Tính năng quản lý ví cho phép người dùng:

- Xem số dư ví hiện tại
- Xem thống kê giao dịch (tổng nạp, tổng rút, tổng chi, số tiền chờ xử lý)
- Nạp tiền vào ví qua cổng thanh toán PayOS
- Rút tiền về tài khoản ngân hàng
- Xem lịch sử giao dịch với bộ lọc và phân trang

## Cấu trúc thư mục

```
src/
├── types/
│   └── wallet.types.ts          # Định nghĩa types cho wallet và transactions
├── services/
│   └── wallet.service.ts        # API calls cho các tính năng wallet
├── components/
│   └── Wallet/
│       ├── index.ts             # Export tất cả components
│       ├── WalletBalance.tsx    # Hiển thị số dư và thống kê
│       ├── WalletActions.tsx    # Các nút thao tác nhanh
│       ├── TransactionList.tsx  # Danh sách lịch sử giao dịch
│       ├── DepositDialog.tsx    # Dialog nạp tiền
│       └── WithdrawDialog.tsx   # Dialog rút tiền
└── pages/
    └── Renter/
        └── MyWallet.tsx         # Trang chính quản lý ví
```

## Components

### 1. WalletBalance

Hiển thị số dư ví và các thống kê:

- Số dư hiện tại (gradient card với màu primary)
- Tổng tiền đã nạp
- Tổng tiền đã rút
- Tổng tiền đã chi
- Số tiền đang chờ xử lý

**Props:**

```typescript
{
  wallet: Wallet | null;
  stats: WalletStats | null;
  loading?: boolean;
}
```

### 2. WalletActions

Các nút thao tác nhanh:

- Nạp tiền vào ví
- Rút tiền về tài khoản
- Xem lịch sử giao dịch

**Props:**

```typescript
{
  onDeposit: () => void;
  onWithdraw: () => void;
  onViewHistory: () => void;
  disabled?: boolean;
}
```

### 3. TransactionList

Danh sách lịch sử giao dịch với:

- Bộ lọc theo loại giao dịch
- Bộ lọc theo trạng thái
- Phân trang
- Hiển thị chi tiết từng giao dịch

**Props:**

```typescript
{
  transactions: Transaction[];
  loading?: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onFilterChange?: (type?, status?) => void;
}
```

### 4. DepositDialog

Dialog nạp tiền với:

- Các mức tiền nạp nhanh (50k, 100k, 200k, 500k, 1M, 2M)
- Nhập số tiền tùy chỉnh
- Tối thiểu: 10,000 ₫
- Tối đa: 50,000,000 ₫
- Tích hợp với PayOS payment gateway

**Props:**

```typescript
{
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

### 5. WithdrawDialog

Dialog rút tiền với:

- Các mức tiền rút nhanh
- Nhập thông tin tài khoản ngân hàng
- Tối thiểu: 50,000 ₫
- Tối đa: Số dư hiện tại
- Thời gian xử lý: 1-3 ngày làm việc

**Props:**

```typescript
{
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentBalance: number;
}
```

## API Endpoints

### GET /Wallets/my-wallet

Lấy thông tin ví của user hiện tại

**Response:**

```typescript
{
  userId: string;
  accountId: string;
  balance: number;
  currency: string;
  status: "Active" | "Suspended" | "Closed";
  createdDate: string;
  updatedDate: string;
}
```

### GET /Wallets/stats

Lấy thống kê ví

**Response:**

```typescript
{
  totalDeposit: number;
  totalWithdraw: number;
  totalSpent: number;
  pendingAmount: number;
  transactionCount: number;
}
```

### GET /Transactions

Lấy danh sách giao dịch

**Query Parameters:**

- `type`: "Deposit" | "Withdraw" | "Payment" | "Refund" | "Rental" | "Return"
- `status`: "Pending" | "Completed" | "Failed" | "Cancelled"
- `fromDate`: string (ISO date)
- `toDate`: string (ISO date)
- `page`: number
- `pageSize`: number

**Response:**

```typescript
{
  items: Transaction[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### POST /Wallets/deposit

Nạp tiền vào ví

**Request:**

```typescript
{
  amount: number;
  returnUrl: string;
  cancelUrl: string;
}
```

**Response:**

```typescript
{
  transactionId: string;
  checkoutUrl: string;
  qrCode?: string;
}
```

### POST /Wallets/withdraw

Rút tiền từ ví

**Request:**

```typescript
{
  amount: number;
  bankAccountNumber: string;
  bankName: string;
  accountHolderName: string;
}
```

**Response:**

```typescript
{
  transactionId: string;
  status: string;
  message: string;
}
```

## Cách sử dụng

### 1. Import components

```typescript
import {
  WalletBalance,
  WalletActions,
  TransactionList,
  DepositDialog,
  WithdrawDialog,
} from "../../components/Wallet";
```

### 2. Import services

```typescript
import {
  getWallet,
  getWalletStats,
  getTransactions,
} from "../../services/wallet.service";
```

### 3. Import types

```typescript
import {
  Wallet,
  WalletStats,
  Transaction,
  TransactionListResponse,
} from "../../types/wallet.types";
```

## Thiết kế UI

### Màu sắc

- **Primary**: #F97316 (Orange-500) - Màu chủ đạo của hệ thống
- **Gradient Card**: Linear gradient từ primary.main đến primary.dark
- **Success**: #059669 (Green-600) - Cho giao dịch nạp tiền, hoàn tiền
- **Warning**: #F59E0B (Amber-500) - Cho giao dịch chờ xử lý
- **Error**: #DC2626 (Red-600) - Cho giao dịch rút tiền, thanh toán, thất bại

### Responsive

- **Mobile (xs)**: 2 cột cho stats, full width cho actions và list
- **Desktop (md+)**: 4 cột cho stats, sidebar cho actions, content area cho list

### Hiệu ứng

- Card hover effects
- Skeleton loading states
- Smooth transitions
- Glassmorphism effects (backdrop blur)

## Lưu ý

- Tất cả API calls cần authentication token
- Số tiền được format theo chuẩn Việt Nam (VND)
- Ngày tháng hiển thị theo format `dd/MM/yyyy HH:mm`
- Transaction types có icon và màu sắc riêng biệt
- Có validation cho số tiền nạp/rút (min, max)
- Có thông báo (snackbar) cho các thao tác thành công/thất bại
