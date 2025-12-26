export interface ContractClause {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface ContractTemplate {
  id: string;
  templateName: string;
  templateCode: string;
  templateType: "Rental" | "Consignment";
  description: string;
  title: string;
  introduction: string;
  clauses: ContractClause[];
  conclusion: string;
  status: "Active" | "Inactive" | "Draft";
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}
export interface ContractSignature {
  id: string;
  role: "Owner" | "Platform" | "Renter";
  isSigned: boolean;
  signedAt?: string;
}

export interface Contract {
  id: string;
  status: string;
  createdAt: string;
  signatures?: ContractSignature[];
  branchName?: string;
  // ...other existing properties...
}