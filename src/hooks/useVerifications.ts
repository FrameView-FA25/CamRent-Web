import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { verificationService } from "../services/verification.service";
import { fetchStaffList } from "../services/booking.service";
import type { Verification } from "../types/verification.types";
import type { Staff } from "../types/booking.types";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useVerifications = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<
    Verification[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  useEffect(() => {
    fetchVerifications();
    loadStaffList();
  }, []);

  useEffect(() => {
    filterVerifications();
  }, [verifications, searchQuery, activeTab]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const data = await verificationService.getVerificationsByUserId();
      setVerifications(data);
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

  const filterVerifications = () => {
    let filtered = [...verifications];

    const tabs = ["all", "pending", "in-progress", "approved", "rejected"];
    if (activeTab > 0) {
      filtered = filtered.filter((v) => v.status === tabs[activeTab]);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.phoneNumber.includes(searchQuery) ||
          v.branchName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredVerifications(filtered);
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
  };
};