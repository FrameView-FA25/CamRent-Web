import { useState, useEffect } from "react";
import type { ContractTemplate } from "../types/contract.types";

// Mock Data
const mockTemplates: ContractTemplate[] = [
  {
    id: "template-1",
    templateName: "Hợp đồng thuê thiết bị tiêu chuẩn",
    templateCode: "HT-THUE-STD-001",
    templateType: "Rental",
    description: "Mẫu hợp đồng chuẩn cho việc thuê camera và phụ kiện",
    title: "HỢP ĐỒNG THUÊ THIẾT BỊ NHIẾP ẢNH",
    introduction: "Hôm nay, ngày ... tháng ... năm ..., tại TP. Hồ Chí Minh, chúng tôi gồm:",
    clauses: [
      {
        id: "clause-1",
        title: "ĐIỀU 1: ĐỐI TƯỢNG CỦA HỢP ĐỒNG",
        content: "Bên A đồng ý cho Bên B thuê các thiết bị nhiếp ảnh theo danh sách chi tiết đính kèm. Các thiết bị được giao trong tình trạng hoạt động tốt, đã qua kiểm tra kỹ thuật.",
        order: 1,
      },
      {
        id: "clause-2",
        title: "ĐIỀU 2: THỜI HẠN THUÊ",
        content: "Thời gian thuê được tính từ ngày ... đến ngày ..., tổng cộng ... ngày. Việc giao và nhận thiết bị được thực hiện tại địa điểm do hai bên thỏa thuận.",
        order: 2,
      },
      {
        id: "clause-3",
        title: "ĐIỀU 3: GIÁ TRỊ HỢP ĐỒNG VÀ PHƯƠNG THỨC THANH TOÁN",
        content: "Tổng giá trị hợp đồng: ... VNĐ (bằng chữ: ...)\n- Tiền cọc: ... VNĐ\n- Phí nền tảng: ... VNĐ\n- Thanh toán: Chuyển khoản hoặc tiền mặt",
        order: 3,
      },
      {
        id: "clause-4",
        title: "ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CỦA BÊN A",
        content: "- Giao thiết bị đúng thời hạn, đúng chất lượng\n- Hướng dẫn sử dụng cơ bản\n- Được nhận lại thiết bị trong tình trạng như khi giao\n- Được giữ lại tiền cọc nếu thiết bị hư hỏng do lỗi của Bên B",
        order: 4,
      },
      {
        id: "clause-5",
        title: "ĐIỀU 5: QUYỀN VÀ NGHĨA VỤ CỦA BÊN B",
        content: "- Sử dụng thiết bị đúng mục đích, đúng cách\n- Bảo quản thiết bị cẩn thận\n- Trả thiết bị đúng hạn, trong tình trạng như khi nhận\n- Chịu trách nhiệm bồi thường nếu làm hư hỏng, mất mát thiết bị",
        order: 5,
      },
      {
        id: "clause-6",
        title: "ĐIỀU 6: ĐIỀU KHOẢN CHUNG",
        content: "- Hai bên cam kết thực hiện đúng các điều khoản đã thỏa thuận\n- Mọi tranh chấp phát sinh được giải quyết thông qua thương lượng\n- Hợp đồng có hiệu lực kể từ ngày ký",
        order: 6,
      },
    ],
    conclusion: "Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.",
    status: "Active",
    isDefault: true,
    createdBy: "Nguyễn Văn Admin",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-11-20T10:30:00Z",
    usageCount: 156,
  },
  {
    id: "template-2",
    templateName: "Hợp đồng thuê thiết bị cao cấp",
    templateCode: "HT-THUE-PRE-001",
    templateType: "Rental",
    description: "Mẫu hợp đồng cho thiết bị cao cấp với điều khoản bảo hiểm",
    title: "HỢP ĐỒNG THUÊ THIẾT BỊ NHIẾP ẢNH CAO CẤP",
    introduction: "Hôm nay, ngày ... tháng ... năm ..., tại TP. Hồ Chí Minh, chúng tôi gồm:",
    clauses: [
      {
        id: "clause-p1",
        title: "ĐIỀU 1: ĐỐI TƯỢNG CỦA HỢP ĐỒNG",
        content: "Bên A đồng ý cho Bên B thuê các thiết bị nhiếp ảnh cao cấp theo danh sách chi tiết đính kèm. Mỗi thiết bị đều có giấy chứng nhận xuất xứ và bảo hành chính hãng.",
        order: 1,
      },
      {
        id: "clause-p2",
        title: "ĐIỀU 2: THỜI HẠN THUÊ VÀ GIAO NHẬN",
        content: "Thời gian thuê được tính từ ngày ... đến ngày .... Giao nhận tại văn phòng hoặc miễn phí vận chuyển trong nội thành.",
        order: 2,
      },
      {
        id: "clause-p3",
        title: "ĐIỀU 3: GIÁ TRỊ VÀ BẢO HIỂM",
        content: "- Giá thuê: ... VNĐ/ngày\n- Tiền cọc: 50% giá trị thiết bị\n- Bảo hiểm: ... VNĐ (tùy chọn)\n- Phí vận chuyển: Miễn phí",
        order: 3,
      },
      {
        id: "clause-p4",
        title: "ĐIỀU 4: ĐIỀU KHOẢN BẢO HIỂM",
        content: "Thiết bị được bảo hiểm toàn diện bao gồm: hư hỏng do tai nạn, mất cắp, thiên tai. Khách hàng chỉ chịu 20% giá trị thiệt hại nếu có bảo hiểm.",
        order: 4,
      },
      {
        id: "clause-p5",
        title: "ĐIỀU 5: HỖ TRỢ KỸ THUẬT",
        content: "Bên A cung cấp hotline 24/7 hỗ trợ kỹ thuật. Miễn phí thay thế thiết bị trong vòng 2 giờ nếu có sự cố kỹ thuật.",
        order: 5,
      },
    ],
    conclusion: "Hợp đồng có giá trị pháp lý kể từ ngày ký. Mỗi bên giữ 01 bản chính.",
    status: "Active",
    isDefault: false,
    createdBy: "Trần Thị Manager",
    createdAt: "2024-03-20T14:15:00Z",
    updatedAt: "2024-11-22T09:45:00Z",
    usageCount: 89,
  },
  {
    id: "template-3",
    templateName: "Hợp đồng ký gửi thiết bị tiêu chuẩn",
    templateCode: "HT-KG-STD-001",
    templateType: "Consignment",
    description: "Mẫu hợp đồng chuẩn cho việc ký gửi camera và phụ kiện lên nền tảng",
    title: "HỢP ĐỒNG KÝ GỬI THIẾT BỊ NHIẾP ẢNH",
    introduction: "Hôm nay, ngày ... tháng ... năm ..., tại TP. Hồ Chí Minh, chúng tôi gồm:\nBên A (Nền tảng): CAMRENT\nBên B (Chủ sở hữu): ...",
    clauses: [
      {
        id: "clause-c1",
        title: "ĐIỀU 1: ĐỐI TƯỢNG KÝ GỬI",
        content: "Bên B đồng ý ký gửi các thiết bị nhiếp ảnh cho Bên A để cho thuê theo danh sách đính kèm. Thiết bị phải còn hoạt động tốt, có đầy đủ giấy tờ.",
        order: 1,
      },
      {
        id: "clause-c2",
        title: "ĐIỀU 2: THỜI HẠN KÝ GỬI",
        content: "Thời gian ký gửi: ... tháng, từ ngày ... đến ngày .... Có thể gia hạn theo thỏa thuận của hai bên.",
        order: 2,
      },
      {
        id: "clause-c3",
        title: "ĐIỀU 3: TỶ LỆ HOA HỒNG",
        content: "- Hoa hồng nền tảng: ...% trên doanh thu thuê\n- Phí nền tảng: ...% \n- Thanh toán: Hàng tháng vào ngày 5",
        order: 3,
      },
      {
        id: "clause-c4",
        title: "ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CỦA BÊN A",
        content: "- Quảng bá thiết bị trên nền tảng\n- Thu tiền thuê và chuyển về cho Bên B\n- Bảo quản thiết bị cẩn thận\n- Kiểm tra thiết bị trước khi cho thuê",
        order: 4,
      },
      {
        id: "clause-c5",
        title: "ĐIỀU 5: QUYỀN VÀ NGHĨA VỤ CỦA BÊN B",
        content: "- Giao thiết bị trong tình trạng tốt\n- Cung cấp đầy đủ thông tin và hướng dẫn\n- Được nhận doanh thu hàng tháng\n- Được rút thiết bị sau thời gian ký gửi",
        order: 5,
      },
      {
        id: "clause-c6",
        title: "ĐIỀU 6: BẢO HIỂM VÀ BỒI THƯỜNG",
        content: "Bên A mua bảo hiểm cho thiết bị trong thời gian ký gửi. Trường hợp thiết bị bị hư hỏng/mất do lỗi của người thuê, Bên A sẽ thu hồi bồi thường và chuyển cho Bên B.",
        order: 6,
      },
    ],
    conclusion: "Hợp đồng được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị như nhau.",
    status: "Active",
    isDefault: true,
    createdBy: "Lê Văn Admin",
    createdAt: "2024-02-10T11:20:00Z",
    updatedAt: "2024-11-18T16:00:00Z",
    usageCount: 67,
  },
  {
    id: "template-4",
    templateName: "Hợp đồng ký gửi dài hạn",
    templateCode: "HT-KG-LONG-001",
    templateType: "Consignment",
    description: "Mẫu hợp đồng cho việc ký gửi dài hạn trên 6 tháng",
    title: "HỢP ĐỒNG KÝ GỬI THIẾT BỊ DÀI HẠN",
    introduction: "Hôm nay, ngày ... tháng ... năm ..., tại TP. Hồ Chí Minh, chúng tôi gồm:",
    clauses: [
      {
        id: "clause-l1",
        title: "ĐIỀU 1: PHẠM VI HỢP ĐỒNG",
        content: "Hợp đồng ký gửi dài hạn áp dụng cho thời gian từ 6 tháng trở lên với các ưu đãi đặc biệt về hoa hồng.",
        order: 1,
      },
      {
        id: "clause-l2",
        title: "ĐIỀU 2: ƯU ĐÃI ĐẶC BIỆT",
        content: "- Giảm hoa hồng nền tảng xuống còn 10%\n- Ưu tiên hiển thị trên trang chủ\n- Miễn phí bảo trì định kỳ\n- Hỗ trợ chụp ảnh sản phẩm chuyên nghiệp",
        order: 2,
      },
      {
        id: "clause-l3",
        title: "ĐIỀU 3: BẢO TRÌ VÀ BẢO DƯỠNG",
        content: "Bên A cam kết bảo trì thiết bị định kỳ 3 tháng/lần, đảm bảo thiết bị luôn trong tình trạng tốt nhất.",
        order: 3,
      },
    ],
    conclusion: "Hợp đồng có hiệu lực trong thời gian ký gửi. Các điều khoản có thể được xem xét điều chỉnh sau 6 tháng.",
    status: "Draft",
    isDefault: false,
    createdBy: "Phạm Thị Manager",
    createdAt: "2024-11-01T09:00:00Z",
    updatedAt: "2024-11-25T14:30:00Z",
    usageCount: 12,
  },
];

export const useContractTemplates = () => {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      setTemplates(mockTemplates);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError(err instanceof Error ? err.message : "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: Omit<ContractTemplate, "id" | "createdAt" | "updatedAt" | "usageCount">) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newTemplate: ContractTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
      };

      setTemplates([...templates, newTemplate]);
      return true;
    } catch (err) {
      console.error("Error creating template:", err);
      return false;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<ContractTemplate>) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setTemplates(
        templates.map((t) =>
          t.id === id
            ? { ...t, ...updates, updatedAt: new Date().toISOString() }
            : t
        )
      );
      return true;
    } catch (err) {
      console.error("Error updating template:", err);
      return false;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setTemplates(templates.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting template:", err);
      return false;
    }
  };

  const duplicateTemplate = async (id: string) => {
    try {
      const original = templates.find((t) => t.id === id);
      if (!original) throw new Error("Template not found");

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newTemplate: ContractTemplate = {
        ...original,
        id: `template-${Date.now()}`,
        templateName: `${original.templateName} (Bản sao)`,
        templateCode: `${original.templateCode}-COPY`,
        isDefault: false,
        status: "Draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
      };

      setTemplates([...templates, newTemplate]);
      return true;
    } catch (err) {
      console.error("Error duplicating template:", err);
      return false;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    refreshTemplates: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  };
};