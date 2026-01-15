"use client";

import { useState, useEffect } from "react";
import { X, Stethoscope, HeartPulse, Activity } from "lucide-react";
import { CareServiceApi } from "@/services/careService";
import { SpecialtyCareConditionService } from "@/services/specialtyCareConditionService";
import { CareCategoryService } from "@/services/careCategoryService";
import { CareService, SpecialtyCareCondition, CareCategory } from "@/types/api";

interface CareServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CareServicesModal({ isOpen, onClose }: CareServicesModalProps) {
  const [careServices, setCareServices] = useState<CareService[]>([]);
  const [specialtyConditions, setSpecialtyConditions] = useState<SpecialtyCareCondition[]>([]);
  const [careCategories, setCareCategories] = useState<CareCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"services" | "conditions" | "categories">("services");

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found. User needs to be logged in.");
        alert("You need to be logged in to view care services. Please log in first.");
        setLoading(false);
        return;
      }

      console.log("Fetching care services...");
      const servicesResponse = await CareServiceApi.getCareServices(1, 100);
      console.log("Care services response:", servicesResponse);

      console.log("Fetching specialty care conditions...");
      const conditionsResponse = await SpecialtyCareConditionService.getSpecialtyCareConditions(1, 100);
      console.log("Specialty conditions response:", conditionsResponse);

      console.log("Fetching care categories...");
      const categoriesResponse = await CareCategoryService.getCareCategories(false, 1, 100);
      console.log("Care categories response:", categoriesResponse);

      if (servicesResponse.success) {
        setCareServices(servicesResponse.payload || []);
        console.log("Set care services:", servicesResponse.payload?.length);
      } else {
        console.error("Failed to fetch care services:", servicesResponse);
      }

      if (conditionsResponse.success) {
        setSpecialtyConditions(conditionsResponse.payload || []);
        console.log("Set specialty conditions:", conditionsResponse.payload?.length);
      } else {
        console.error("Failed to fetch specialty conditions:", conditionsResponse);
      }

      if (categoriesResponse.success) {
        setCareCategories(categoriesResponse.payload || []);
        console.log("Set care categories:", categoriesResponse.payload?.length);
      } else {
        console.error("Failed to fetch care categories:", categoriesResponse);
      }
    } catch (error) {
      console.error("Error fetching care data:", error);
      // Show error to user
      alert(`Error fetching care data: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-semibold mb-6">Care Services & Conditions</h2>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center ${
              activeTab === "services"
                ? "border-b-2 border-[#00C2CB] text-[#00C2CB]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("services")}
          >
            <Stethoscope className="h-4 w-4 mr-2" />
            Care Services
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center ${
              activeTab === "conditions"
                ? "border-b-2 border-[#00C2CB] text-[#00C2CB]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("conditions")}
          >
            <HeartPulse className="h-4 w-4 mr-2" />
            Speciality Conditions
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center ${
              activeTab === "categories"
                ? "border-b-2 border-[#00C2CB] text-[#00C2CB]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("categories")}
          >
            <Activity className="h-4 w-4 mr-2" />
            Care Categories
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00C2CB]"></div>
          </div>
        )}

        {/* Content based on active tab */}
        {!loading && (
          <div className="max-h-[60vh] overflow-y-auto">
            {activeTab === "services" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Care Services</h3>
                {careServices.length > 0 ? (
                  careServices.map((service) => (
                    <div 
                      key={service.id} 
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          service.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {service.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex text-xs text-gray-500 mt-2 space-x-4">
                        <span>Created: {new Date(service.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {service.updatedAt !== "0001-01-01T00:00:00" 
                          ? new Date(service.updatedAt).toLocaleDateString() 
                          : "N/A"}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No care services found</p>
                )}
              </div>
            )}

            {activeTab === "conditions" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Speciality Care Conditions</h3>
                {specialtyConditions.length > 0 ? (
                  specialtyConditions.map((condition) => (
                    <div 
                      key={condition.id} 
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{condition.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{condition.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          condition.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {condition.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex text-xs text-gray-500 mt-2 space-x-4">
                        <span>Created: {new Date(condition.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {condition.updatedAt !== "0001-01-01T00:00:00" 
                          ? new Date(condition.updatedAt).toLocaleDateString() 
                          : "N/A"}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No speciality care conditions found</p>
                )}
              </div>
            )}

            {activeTab === "categories" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Care Categories</h3>
                {careCategories.length > 0 ? (
                  careCategories.map((category) => (
                    <div 
                      key={category.id} 
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          category.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-500">
                        <span>Platform Fee: {(category.platformFee * 100).toFixed(2)}%</span>
                        <span>Hourly Rate: ${category.hourlyRate.toFixed(2)}</span>
                        <span>Experience Level: {category.experienceLevel}</span>
                        <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No care categories found</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}