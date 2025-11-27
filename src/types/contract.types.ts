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