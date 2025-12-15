export interface Branch {
  id: string;
  name: string;
  address: {
    country: string;
    province: string;
    district: string;
    ward: string;
    line1: string;
    line2: string | null;
    postalCode: string;
    latitude: number | null;
    longitude: number | null;
  };
  managerId: string;
  managerName: string | null;
  userMemberships: UserMembership[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserMembership {
  userId: string;
  fullName: string;
  phone: string;
  email: string;
}

export interface CreateBranchRequest {
  name: string;
  address: {
    country: string;
    province: string;
    district: string;
  };
}

export interface StaffMember {
  id: string;
  userId: string;
  userName: string;
  email: string;
  fullName: string;
  role: string;
  joinedDate: string;
}

export interface AssignStaffRequest {
  branchId: string;
  staffId: string;
}

export interface UnassignedStaff {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
}
export interface UnassignedManager {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
}
// Phản hồi khi kiểm tra có thể xóa thành viên khỏi chi nhánh hay không
export interface RemoveMemberValidation {
  canRemove: boolean;
  blockers: {
    bookings?: number;
    contracts?: number;
    verifications?: number;
    inspections?: number;
    disputes?: number;
  };
  messages: string[];
}
