import { toast } from "react-toastify";
import type { Verification } from "@/types/verification.types";

export const handleContractConfirm = async (
  selectedVerification: Verification | null,
  setContractLoading: (loading: boolean) => void,
  setPdfUrl: (url: string) => void,
  setCurrentContractId: (id: string) => void,
  setCurrentFilename: (filename: string) => void,
  setPdfDialogOpen: (open: boolean) => void,
  setContractDialogOpen: (open: boolean) => void
) => {
  if (!selectedVerification) return;
  const token = localStorage.getItem("accessToken");
  
  try {
    setContractLoading(true);

    const createResponse = await fetch(
      `https://camrent-backend.up.railway.app/api/Contracts/verification/${selectedVerification.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(errorData.message || errorData.title || "Tạo hợp đồng thất bại");
    }

    const contractData = await createResponse.json();
    const contractId = contractData.id;

    const previewResponse = await fetch(
      `https://camrent-backend.up.railway.app/api/Contracts/${contractId}/preview`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!previewResponse.ok) {
      throw new Error("Không thể lấy preview hợp đồng");
    }

    const contentDisposition = previewResponse.headers.get("content-disposition");
    let filename = `contract_${contractId}.pdf`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(
        /filename[^;=\n]*=(?:(["'])([^"'\n]*)\1|([^;\n]*));?/
      );
      if (filenameMatch && filenameMatch[2]) {
        filename = filenameMatch[2];
      }
    }

    const blob = await previewResponse.blob();
    const pdfBlob = new Blob([blob], { type: "application/pdf" });
    const url = window.URL.createObjectURL(pdfBlob);

    setPdfUrl(url);
    setCurrentContractId(contractId);
    setCurrentFilename(filename);
    setPdfDialogOpen(true);
    setContractDialogOpen(false);
    setContractLoading(false);

    toast.success("Tạo hợp đồng thành công!");
  } catch (error) {
    console.error("Contract error:", error);
    toast.error(error instanceof Error ? error.message : "Lỗi khi tạo hợp đồng");
    setContractLoading(false);
  }
};

export const handleDownloadPdf = (
  pdfUrl: string | null,
  currentFilename: string,
  setPdfDialogOpen: (open: boolean) => void,
  setPdfUrl: (url: string | null) => void
) => {
  if (!pdfUrl) return;

  const link = document.createElement("a");
  link.href = pdfUrl;
  link.download = currentFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success("File đã tải xuống thành công");
  setPdfDialogOpen(false);
  setPdfUrl(null);
};