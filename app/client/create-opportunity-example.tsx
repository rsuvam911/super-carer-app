import { useState } from "react";
import CreateOpportunityModal from "@/components/modal/create-opportunity-modal";

export default function CreateOpportunityPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    alert("Opportunity created successfully!");
  };

  const handleError = (error: any) => {
    console.error("Error creating opportunity:", error);
    alert("Failed to create opportunity. Please try again.");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Opportunity</h1>

          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ready to create a new opportunity?</h2>
            <p className="text-gray-600 mb-6">
              Click the button below to start the step-by-step process of creating a new care opportunity for your client.
            </p>
            <button
              onClick={handleOpenModal}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Create New Opportunity
            </button>
          </div>
        </div>
      </div>

      <CreateOpportunityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
}