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
  userMemberships: unknown[];
}
