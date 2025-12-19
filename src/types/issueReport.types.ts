export interface IssueReportDevice {
  itemType: string;
  itemId: string;
  name: string;
  serialNumber: string;
}

export interface IssueReport {
  id: string;
  bookingId: string;
  bookingCode: string;
  createdAt: string;
  title: string;
  severity: "minor" | "major" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  reporterName: string;
  devices: IssueReportDevice[];
}

export interface IssueReportDetail extends IssueReport {
  description: string;
  reporterUserId: string;
  imageUrls: string[];
}