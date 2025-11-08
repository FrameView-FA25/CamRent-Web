import type { Booking } from "../../types/booking.types";

export const getItemsDisplay = (booking: Booking): string => {
  const items: string[] = [];
  booking.items.forEach((item) => {
    if (item.camera) {
      items.push(`${item.camera.brand} ${item.camera.model}`);
    }
    if (item.accessory) {
      items.push(`${item.accessory.brand} ${item.accessory.model}`);
    }
    if (item.combo) {
      items.push(item.combo.name);
    }
  });
  return items.join(", ") || "N/A";
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatDateRange = (pickupAt: string, returnAt: string): string => {
  const pickup = new Date(pickupAt).toLocaleDateString("vi-VN");
  const returnDate = new Date(returnAt).toLocaleDateString("vi-VN");
  return `${pickup} — ${returnDate}`;
};
