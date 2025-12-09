import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { verificationService } from "../services/verification.service";
import { fetchStaffList } from "../services/booking.service";
import type { Verification } from "../types/verification.types";
import type { Staff } from "../types/booking.types";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type SortOrder = "newest" | "alphabetical";

export const useVerifications = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<
    Verification[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  useEffect(() => {
    fetchVerifications();
    loadStaffList();
  }, []);

  const filterVerifications = useCallback(() => {
    let filtered = [...verifications];

    const tabs = ["all", "pending", "in-progress", "approved", "rejected"];
    if (activeTab > 0) {
      const target = tabs[activeTab];
      filtered = filtered.filter(
        (v) => v.status?.toString().toLowerCase() === target
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.phoneNumber.includes(searchQuery) ||
          (v.branchName?.toLowerCase().includes(searchQuery.toLowerCase()) ??
            false)
      );
    }

    // ✅ Apply sorting
    filtered.sort((a, b) => {
      if (sortOrder === "newest") {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      } else {
        // Alphabetical by name
        return a.name.localeCompare(b.name, 'vi');
      }
    });

    setFilteredVerifications(filtered);
  }, [verifications, searchQuery, activeTab, sortOrder]);

  useEffect(() => {
    filterVerifications();
  }, [filterVerifications]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const data = await verificationService.getVerificationsByUserId();
      
      // ✅ Sort by createdAt (newest first)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
      
      setVerifications(sortedData);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load verifications"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStaffList = async () => {
    try {
      const { staff, error } = await fetchStaffList();
      if (error) {
        console.error("Error loading staff:", error);
        return;
      }
      setStaffList(staff);
    } catch (error) {
      console.error("Error loading staff:", error);
    }
  };

  const assignStaff = async (verificationId: string, staffId: string) => {
    try {
      await verificationService.assignStaff(verificationId, staffId);
      toast.success("Staff assigned successfully");
      await fetchVerifications();
      return true;
    } catch (error) {
      console.error("Error assigning staff:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to assign staff"
      );
      return false;
    }
  };
  const updateStatus = async (
    verificationId: string,
    status: string,
    note: string
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_BASE_URL}/Verifications/${verificationId}/update-status?note=${encodeURIComponent(
          note
        )}&status=${status}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update status error:", errorText);
        throw new Error("Failed to update status");
      }

      toast.success("Status updated successfully");
      await fetchVerifications(); // Refresh list
      return true;
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
      return false;
    }
  };

  return {
    verifications,
    filteredVerifications,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    loading,
    staffList,
    assignStaff,
    updateStatus, // ✅ Export updateStatus
    refreshVerifications: fetchVerifications,
    sortOrder,
    setSortOrder,
  };
};