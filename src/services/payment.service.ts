const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface AuthorizePaymentRequest {
  bookingId: string;
  mode: "Deposit" | "FullPayment";
}

export interface AuthorizePaymentResponse {
  paymentId: string;
  amount: number;
  status: string;
}

export interface CreatePayOsPaymentRequest {
  returnUrl: string;
  cancelUrl: string;
}

export interface CreatePayOsPaymentResponse {
  checkoutUrl: string;
  paymentId: string;
  qrCode?: string;
}

/**
 * Step 1: Authorize payment - Khởi tạo payment
 * POST /api/Payments/authorize
 */
export async function authorizePayment(
  request: AuthorizePaymentRequest
): Promise<AuthorizePaymentResponse> {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Vui lòng đăng nhập để thực hiện thanh toán");
  }

  const response = await fetch(`${API_BASE_URL}/Payments/authorize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errorMessage = `Khởi tạo thanh toán thất bại với mã lỗi ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  const paymentIdRaw = await response.text();
  // Loại bỏ ngoặc kép và khoảng trắng
  const paymentId = paymentIdRaw.trim().replace(/^["']|["']$/g, "");
  
  console.log("Authorized payment ID:", paymentId);

  return {
    paymentId,
    amount: 0,
    status: "Pending",
  };
}

/**
 * Step 2: Create PayOS payment link
 * POST /api/Payments/{id}/payos
 */
export async function createPayOsPayment(
  paymentId: string,
  request: CreatePayOsPaymentRequest
): Promise<CreatePayOsPaymentResponse> {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Vui lòng đăng nhập để thực hiện thanh toán");
  }

  console.log("Creating PayOS payment for ID:", paymentId);

  const response = await fetch(
    `${API_BASE_URL}/Payments/${paymentId}/payos`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    let errorMessage = `Tạo link thanh toán thất bại với mã lỗi ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  // Parse response as text first
  const responseText = await response.text();
  console.log("Raw PayOS response:", responseText);

  let checkoutUrl: string;

  try {
    // Try to parse as JSON
    const jsonResponse = JSON.parse(responseText);
    
    // Check if response has redirectUrl property
    if (jsonResponse.redirectUrl) {
      checkoutUrl = jsonResponse.redirectUrl;
    } else if (jsonResponse.checkoutUrl) {
      checkoutUrl = jsonResponse.checkoutUrl;
    } else if (typeof jsonResponse === "string") {
      checkoutUrl = jsonResponse;
    } else {
      // If JSON but no expected property, stringify and log
      console.error("Unexpected JSON structure:", jsonResponse);
      throw new Error("Invalid response format from PayOS");
    }
  } catch (parseError) {
    // If not JSON, treat as plain text URL
    checkoutUrl = responseText;
  }

  // Clean up the URL
  checkoutUrl = checkoutUrl.trim().replace(/^["']|["']$/g, "");

  console.log("Final checkout URL:", checkoutUrl);

  // Validate URL format
  if (!checkoutUrl.startsWith("http://") && !checkoutUrl.startsWith("https://")) {
    console.error("Invalid URL format:", checkoutUrl);
    throw new Error("Invalid checkout URL received");
  }

  return {
    checkoutUrl,
    paymentId,
  };
}

/**
 * Complete payment flow - Combine 2 steps above
 */
export async function initiatePayment(
  bookingId: string,
  mode: "Deposit" | "FullPayment" = "Deposit"
): Promise<string> {
  try {
    // Step 1: Authorize payment
    const authResponse = await authorizePayment({
      bookingId,
      mode,
    });

    console.log("Payment authorized:", authResponse.paymentId);

    // Step 2: Create PayOS payment link
    const payosResponse = await createPayOsPayment(authResponse.paymentId, {
      returnUrl: `${window.location.origin}/payment-success`,
      cancelUrl: `${window.location.origin}/payment-failed`,
    });

    console.log("PayOS checkout URL:", payosResponse.checkoutUrl);

    return payosResponse.checkoutUrl;
  } catch (error: any) {
    console.error("Payment initiation failed:", error);
    throw new Error(error.message || "Không thể khởi tạo thanh toán");
  }
}

/**
 * Get payment details
 */
export async function getPaymentDetails(paymentId: string): Promise<any> {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Vui lòng đăng nhập");
  }

  const response = await fetch(`${API_BASE_URL}/api/Payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Không thể lấy thông tin thanh toán");
  }

  return await response.json();
}

/**
 * Cancel payment
 */
export async function cancelPayment(paymentId: string): Promise<void> {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Vui lòng đăng nhập");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/Payments/${paymentId}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Không thể hủy thanh toán");
  }
}