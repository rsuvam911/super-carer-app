"use client";

import { useState } from "react";
import CreateOpportunityModal from "@/components/modal/create-opportunity-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Calendar, MapPin, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function CreateOpportunityPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userRole } = useAuth();

  // Ensure this page is only accessible to clients
  if (userRole !== "client") {
    return <div>Access denied. Clients only.</div>;
  }

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Opportunity</h1>
          <p className="text-gray-600 mt-2">
            Fill out the form below to create a new care opportunity for your loved one.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              About the Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-blue-900">Flexible Scheduling</h3>
                </div>
                <p className="text-sm text-blue-700">
                  Set up custom schedules with our intuitive calendar system
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-green-900">Location Based</h3>
                </div>
                <p className="text-sm text-green-700">
                  Specify exact location and care requirements
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <h3 className="font-medium text-purple-900">Custom Care</h3>
                </div>
                <p className="text-sm text-purple-700">
                  Tailor care services to individual needs and preferences
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ready to Create?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Start Creating Your Opportunity</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Our step-by-step process will guide you through creating a comprehensive care opportunity that matches your needs.
              </p>
              <Button
                onClick={handleOpenModal}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Create New Opportunity
              </Button>
            </div>
          </CardContent>
        </Card>

        <CreateOpportunityModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </div>
  );
}