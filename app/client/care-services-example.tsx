"use client";

import { useState } from "react";
import CareServicesModal from "@/components/modal/care-services-modal";

export default function CareServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    // Check if user is authenticated before opening modal
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("You need to be logged in to view care services. Please log in first.");
      return;
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Care Services & Conditions</h1>

          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">View Care Services, Conditions & Categories</h2>
            <p className="text-gray-600 mb-6">
              Click the button below to view all available care services, speciality care conditions, and care categories.
            </p>
            <button
              onClick={handleOpenModal}
              className="px-6 py-3 bg-[#00C2CB] text-white rounded-md hover:bg-[#00b0b9] transition-colors font-medium"
            >
              View Care Data
            </button>
          </div>
        </div>
      </div>

      <CareServicesModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}