"use client";

import AddressAutocomplete from "@/components/AddressAutocomplete";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import CareCategoryService from "@/services/careCategoryService";
import CareServiceApi from "@/services/careService";
import { CreateOpportunityRequest, OpportunityService } from "@/services/opportunityService";
import PlatformLanguageService, { PlatformLanguage } from "@/services/platformLanguageService";
import SpecialtyCareConditionService from "@/services/specialtyCareConditionService";
import { CareCategory, CareService, SpecialtyCareCondition } from "@/types/api";
import { Calendar, CheckCircle, ChevronLeft, ChevronRight, Clock, FileText, Loader2, MapPin, User, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";


interface CreateOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

interface OpportunityFormData {
  title: string;
  description: string;
  recipientName: string;
  location: {
    streetAddress: string;
    city: string | null;
    state: string;
    zipCode: string | null;
    country: string;
    latitude: number | null;
    longitude: number | null;
  };
  helpStartTimeframe: string;
  weeklyHoursRange: string;
  careDuration: string;
  categoryId: string;
  careServiceIds: string[];
  specialtyConditionIds: string[];
  medicalNotes: string;
  preferredGender: string;
  preferredLanguageIds: string[];
  startDate: string;
  scheduleDays: Array<{
    day: string;
    scheduleTimes: string[];
  }>;
}

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const timeSlots = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM", "08:00 PM"
];

export default function CreateOpportunityModal({
  isOpen,
  onClose,
  onSuccess,
  onError
}: CreateOpportunityModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [careCategories, setCareCategories] = useState<CareCategory[]>([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [careServices, setCareServices] = useState<CareService[]>([]);
  const [isCareServiceLoading, setIsCareServiceLoading] = useState(false);
  const [careServiceError, setCareServiceError] = useState<string | null>(null);
  const [specialtyConditions, setSpecialtyConditions] =
    useState<SpecialtyCareCondition[]>([]);
  const [isConditionLoading, setIsConditionLoading] = useState(false);
  const [conditionError, setConditionError] = useState<string | null>(null);
  const [languages, setLanguages] = useState<PlatformLanguage[]>([]);
  const [isLanguageLoading, setIsLanguageLoading] = useState(false);
  const [languageError, setLanguageError] = useState<string | null>(null);

  const [formData, setFormData] = useState<OpportunityFormData>({
    title: "",
    description: "",
    recipientName: "",
    location: {
      streetAddress: "",
      city: null,
      state: "",
      zipCode: null,
      country: "",
      latitude: null,
      longitude: null,
    },
    helpStartTimeframe: "",
    weeklyHoursRange: "",
    careDuration: "",
    categoryId: "",
    careServiceIds: [],
    specialtyConditionIds: [],
    medicalNotes: "",
    preferredGender: "",
    preferredLanguageIds: [],
    startDate: "",
    scheduleDays: [],
  });

  const totalSteps = 4;

  // --- Data Fetching Effects ---
  useEffect(() => {
    if (!isOpen) return;

    const fetchCareCategories = async () => {
      setIsCategoryLoading(true);
      setCategoryError(null);

      try {
        const response = await CareCategoryService.getCareCategories(false, 1, 10);

        if (!response.success) {
          setCategoryError(response.message);
          return;
        }

        setCareCategories(response.payload);
      } catch (error) {
        console.error("Failed to load care categories", error);
        setCategoryError("Failed to load care categories");
      } finally {
        setIsCategoryLoading(false);
      }
    };

    fetchCareCategories();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCareServices = async () => {
      setIsCareServiceLoading(true);
      setCareServiceError(null);

      try {
        const response = await CareServiceApi.getCareServices(
          1,
          10,
          "Name",
          false,
          "",
          false
        );

        setCareServices(response.payload);
      } catch (error) {
        console.error("Failed to load care services", error);
        setCareServiceError("Failed to load care services");
      } finally {
        setIsCareServiceLoading(false);
      }
    };

    fetchCareServices();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchSpecialtyConditions = async () => {
      setIsConditionLoading(true);
      setConditionError(null);

      try {
        const response =
          await SpecialtyCareConditionService.getSpecialtyCareConditions(
            1,
            10,
            "Name",
            false,
            "",
            false
          );

        setSpecialtyConditions(response.payload);
      } catch (error) {
        console.error("Failed to load specialty care conditions", error);
        setConditionError("Failed to load specialty care conditions");
      } finally {
        setIsConditionLoading(false);
      }
    };

    fetchSpecialtyConditions();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLanguages = async () => {
      setIsLanguageLoading(true);
      setLanguageError(null);

      try {
        const response =
          await PlatformLanguageService.getPlatformLanguages();

        // only active languages
        setLanguages(response.payload.filter(l => l.isActive));
      } catch (error) {
        console.error("Failed to load platform languages", error);
        setLanguageError("Failed to load languages");
      } finally {
        setIsLanguageLoading(false);
      }
    };

    fetchLanguages();
  }, [isOpen]);

  // --- Handlers ---

  // Wrapped in useCallback with empty deps to prevent infinite loops
  const handleInputChange = useCallback((field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof OpportunityFormData] as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  }, []);

  const handleAddressSelect = useCallback((address: {
    streetAddress: string;
    city: string | null;
    state: string;
    zipCode: string | null;
    country: string;
    latitude: number | null;
    longitude: number | null;
  }) => {
    setFormData(prev => ({
      ...prev,
      location: {
        streetAddress: address.streetAddress,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        latitude: address.latitude,
        longitude: address.longitude
      }
    }));
  }, []);

  const handleScheduleDayChange = useCallback((day: string, times: string[]) => {
    setFormData(prev => {
      const existingDayIndex = prev.scheduleDays.findIndex(d => d.day === day);

      if (existingDayIndex >= 0) {
        if (times.length === 0) {
          // Remove day if no times selected
          return {
            ...prev,
            scheduleDays: prev.scheduleDays.filter(d => d.day !== day)
          };
        } else {
          // Update existing day
          const updatedDays = [...prev.scheduleDays];
          updatedDays[existingDayIndex] = { day, scheduleTimes: times };
          return {
            ...prev,
            scheduleDays: updatedDays
          };
        }
      } else {
        // Add new day
        return {
          ...prev,
          scheduleDays: [...prev.scheduleDays, { day, scheduleTimes: times }]
        };
      }
    });
  }, []);

  const handleLanguageToggle = useCallback((languageId: string) => {
    setFormData(prev => {
      const currentLanguages = [...prev.preferredLanguageIds];
      const index = currentLanguages.indexOf(languageId);

      if (index > -1) {
        currentLanguages.splice(index, 1);
      } else {
        currentLanguages.push(languageId);
      }

      return {
        ...prev,
        preferredLanguageIds: currentLanguages
      };
    });
  }, []);

  const handleServiceToggle = useCallback((serviceId: string) => {
    setFormData(prev => {
      const currentServices = [...prev.careServiceIds];
      const index = currentServices.indexOf(serviceId);

      if (index > -1) {
        currentServices.splice(index, 1);
      } else {
        currentServices.push(serviceId);
      }

      return {
        ...prev,
        careServiceIds: currentServices
      };
    });
  }, []);

  const handleConditionToggle = useCallback((conditionId: string) => {
    setFormData(prev => {
      const currentConditions = [...prev.specialtyConditionIds];
      const index = currentConditions.indexOf(conditionId);

      if (index > -1) {
        currentConditions.splice(index, 1);
      } else {
        currentConditions.push(conditionId);
      }

      return {
        ...prev,
        specialtyConditionIds: currentConditions
      };
    });
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, totalSteps]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Prepare the data to match the API requirements
      const opportunityData: CreateOpportunityRequest = {
        title: formData.title,
        description: formData.description,
        recipientName: formData.recipientName,
        location: {
          streetAddress: formData.location.streetAddress,
          city: formData.location.city,
          state: formData.location.state,
          zipCode: formData.location.zipCode,
          country: formData.location.country,
          latitude: formData.location.latitude,
          longitude: formData.location.longitude
        },
        helpStartTimeframe: formData.helpStartTimeframe,
        weeklyHoursRange: formData.weeklyHoursRange,
        careDuration: formData.careDuration,
        categoryId: formData.categoryId,
        careServiceIds: formData.careServiceIds,
        specialtyConditionIds: formData.specialtyConditionIds,
        medicalNotes: formData.medicalNotes,
        preferredGender: formData.preferredGender,
        preferredLanguageIds: formData.preferredLanguageIds,
        startDate: formData.startDate,
        scheduleDays: formData.scheduleDays
      };

      await OpportunityService.createOpportunity(opportunityData);

      if (onSuccess) {
        onSuccess();
      }

      // Reset form and close modal
      setFormData({
        title: "",
        description: "",
        recipientName: "",
        location: {
          streetAddress: "",
          city: null,
          state: "",
          zipCode: null,
          country: "",
          latitude: null,
          longitude: null,
        },
        helpStartTimeframe: "",
        weeklyHoursRange: "",
        careDuration: "",
        categoryId: "",
        careServiceIds: [],
        specialtyConditionIds: [],
        medicalNotes: "",
        preferredGender: "",
        preferredLanguageIds: [],
        startDate: "",
        scheduleDays: [],
      });
      setCurrentStep(1);
      onClose();
    } catch (error) {
      console.error("Error creating opportunity:", error);
      if (onError) {
        onError(error);
      }
      alert("Failed to create opportunity. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStepPercentage = () => {
    return Math.round((currentStep / totalSteps) * 100);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() !== "" &&
          formData.recipientName.trim() !== "" &&
          formData.categoryId !== "";
      case 2:
        return formData.location.streetAddress !== "" &&
          formData.location.city !== null &&
          formData.location.state !== "" &&
          formData.location.country !== "";
      case 3:
        return formData.startDate !== "" &&
          formData.weeklyHoursRange !== "" &&
          formData.careDuration !== "";
      case 4:
        return formData.scheduleDays.length > 0;
      default:
        return true;
    }
  };

  if (!isOpen) return null;

  const StepIcon = ({ step }: { step: number }) => {
    const icons = [
      <FileText className="h-4 w-4" />,
      <MapPin className="h-4 w-4" />,
      <Calendar className="h-4 w-4" />,
      <User className="h-4 w-4" />
    ];
    return icons[step - 1] || <div className="h-4 w-4" />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative flex flex-col max-h-[95vh] overflow-hidden border border-slate-200/60">

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Create Opportunity
                <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Step {currentStep} of {totalSteps}
                </span>
              </h2>
              <p className="text-slate-500 mt-1 text-sm font-medium">
                {currentStep === 1 && "Let's start with the basic details."}
                {currentStep === 2 && "Where will the care be provided?"}
                {currentStep === 3 && "Define the timing and duration."}
                {currentStep === 4 && "Specify preferences and finalize schedule."}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-2 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div className="text-right">
                {/* Placeholder for future step indicators if needed */}
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-200">
              <div
                style={{ width: `${getStepPercentage()}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
              ></div>
            </div>
            <div className="flex justify-between text-xs font-medium text-slate-400 uppercase tracking-wider">
              <span className={currentStep >= 1 ? "text-indigo-600" : ""}>Basics</span>
              <span className={currentStep >= 2 ? "text-indigo-600" : ""}>Location</span>
              <span className={currentStep >= 3 ? "text-indigo-600" : ""}>Schedule</span>
              <span className={currentStep >= 4 ? "text-indigo-600" : ""}>Review</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-700 font-semibold">Opportunity Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Elderly Care Assistant Needed"
                    className="h-11 focus-visible:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientName" className="text-slate-700 font-semibold">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange("recipientName", e.target.value)}
                    placeholder="Enter the name of the person receiving care"
                    className="h-11 focus-visible:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId" className="text-slate-700 font-semibold">Care Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => handleInputChange("categoryId", value)}
                    disabled={isCategoryLoading}
                  >
                    <SelectTrigger className="h-11 focus-visible:ring-indigo-500 bg-white">
                      <SelectValue
                        placeholder={
                          isCategoryLoading
                            ? "Loading categories..."
                            : "Select a care category"
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      {careCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                      {!isCategoryLoading && careCategories.length === 0 && (
                        <div className="px-3 py-2 text-sm text-slate-500">
                          No categories available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {categoryError && (
                    <p className="text-sm text-red-500 mt-1">{categoryError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700 font-semibold">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Provide detailed information about the care opportunity..."
                    rows={5}
                    className="focus-visible:ring-indigo-500 resize-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Location Details */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="streetAddress" className="text-slate-700 font-semibold">Street Address</Label>
                  <AddressAutocomplete
                    value={formData.location.streetAddress}
                    onChange={(value) => handleInputChange("location.streetAddress", value)}
                    onSelect={handleAddressSelect}
                    placeholder="Enter an address..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-slate-700 font-semibold">City</Label>
                    <Input
                      id="city"
                      name="location.city"
                      value={formData.location.city || ''}
                      onChange={(e) => handleInputChange("location.city", e.target.value)}
                      placeholder="New York"
                      className="h-11 focus-visible:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-slate-700 font-semibold">State</Label>
                    <Input
                      id="state"
                      name="location.state"
                      value={formData.location.state}
                      onChange={(e) => handleInputChange("location.state", e.target.value)}
                      placeholder="NY"
                      className="h-11 focus-visible:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-slate-700 font-semibold">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="location.zipCode"
                      value={formData.location.zipCode || ''}
                      onChange={(e) => handleInputChange("location.zipCode", e.target.value)}
                      placeholder="10001"
                      className="h-11 focus-visible:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-slate-700 font-semibold">Country</Label>
                    <Input
                      id="country"
                      name="location.country"
                      value={formData.location.country}
                      onChange={(e) => handleInputChange("location.country", e.target.value)}
                      placeholder="United States"
                      className="h-11 focus-visible:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Schedule & Duration */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-slate-700 font-semibold">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      className="h-11 focus-visible:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="careDuration" className="text-slate-700 font-semibold">Care Duration</Label>
                    <Select
                      value={formData.careDuration}
                      onValueChange={(value) => handleInputChange("careDuration", value)}
                    >
                      <SelectTrigger className="h-11 focus-visible:ring-indigo-500 bg-white">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short-term">Short Term (Less than 3 months)</SelectItem>
                        <SelectItem value="medium-term">Medium Term (3-6 months)</SelectItem>
                        <SelectItem value="long-term">Long Term (More than 6 months)</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weeklyHoursRange" className="text-slate-700 font-semibold">Weekly Hours Range</Label>
                  <Select
                    value={formData.weeklyHoursRange}
                    onValueChange={(value) => handleInputChange("weeklyHoursRange", value)}
                  >
                    <SelectTrigger className="h-11 focus-visible:ring-indigo-500 bg-white">
                      <SelectValue placeholder="Select weekly hours" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="part-time">Part-time (1-15 hours)</SelectItem>
                      <SelectItem value="half-time">Half-time (16-25 hours)</SelectItem>
                      <SelectItem value="full-time">Full-time (26-40 hours)</SelectItem>
                      <SelectItem value="live-in">Live-in (40+ hours)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="helpStartTimeframe" className="text-slate-700 font-semibold">Help Needed Start Timeframe</Label>
                  <Select
                    value={formData.helpStartTimeframe}
                    onValueChange={(value) => handleInputChange("helpStartTimeframe", value)}
                  >
                    <SelectTrigger className="h-11 focus-visible:ring-indigo-500 bg-white">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediately">Immediately</SelectItem>
                      <SelectItem value="within-week">Within a week</SelectItem>
                      <SelectItem value="within-month">Within a month</SelectItem>
                      <SelectItem value="specific-date">Specific date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 4: Preferences & Services */}
            {currentStep === 4 && (
              <div className="space-y-8 animate-fadeIn pb-4">

                {/* Gender & Language Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-slate-700 font-semibold text-base">Preferred Gender</Label>
                    <RadioGroup
                      value={formData.preferredGender || "no-preference"}
                      onValueChange={(value) => handleInputChange("preferredGender", value)}
                      className="flex flex-col space-y-3"
                    >
                      {["male", "female", "no-preference"].map((option) => (
                        <div key={option} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                          <RadioGroupItem value={option} id={`gender-${option}`} className="border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                          <Label htmlFor={`gender-${option}`} className="cursor-pointer font-normal text-slate-600 capitalize">
                            {option.replace("-", " ")}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-slate-700 font-semibold text-base">Preferred Languages</Label>
                    <div className="flex flex-wrap gap-2">
                      {languages.map(lang => (
                        <div
                          key={lang.id}
                          onClick={() => handleLanguageToggle(lang.id)}
                          className={`cursor-pointer select-none transition-all duration-200 px-4 py-2 rounded-full text-sm font-medium border ${formData.preferredLanguageIds.includes(lang.id)
                            ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full border ${formData.preferredLanguageIds.includes(lang.id)
                              ? "bg-indigo-500 border-indigo-500"
                              : "border-slate-300 bg-white"
                              }`}></div>
                            {lang.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Services & Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-700 font-semibold text-base">Care Services</Label>
                      {careServiceError && <span className="text-xs text-red-500">Error loading</span>}
                    </div>

                    {isCareServiceLoading ? (
                      <div className="flex items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-sm">
                        Loading services...
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {careServices.map((service) => (
                          <div
                            key={service.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${formData.careServiceIds.includes(service.id)
                              ? "bg-indigo-50/50 border-indigo-200 shadow-sm"
                              : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                              }`}
                          >
                            <Checkbox
                              id={`service-${service.id}`}
                              checked={formData.careServiceIds.includes(service.id)}
                              onCheckedChange={() => handleServiceToggle(service.id)}
                              className="border-slate-400 text-indigo-600 focus:ring-indigo-500"
                            />
                            <Label htmlFor={`service-${service.id}`} className="cursor-pointer flex-1 text-slate-700">
                              {service.name}
                            </Label>
                          </div>
                        ))}
                        {careServices.length === 0 && !isCareServiceLoading && (
                          <div className="text-sm text-slate-400 italic p-2">No services available</div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-700 font-semibold text-base">Specialty Conditions</Label>
                      {conditionError && <span className="text-xs text-red-500">Error loading</span>}
                    </div>

                    {isConditionLoading ? (
                      <div className="flex items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-sm">
                        Loading conditions...
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {specialtyConditions.map((condition) => (
                          <div
                            key={condition.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${formData.specialtyConditionIds.includes(condition.id)
                              ? "bg-indigo-50/50 border-indigo-200 shadow-sm"
                              : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                              }`}
                          >
                            <Checkbox
                              id={`condition-${condition.id}`}
                              checked={formData.specialtyConditionIds.includes(condition.id)}
                              onCheckedChange={() => handleConditionToggle(condition.id)}
                              className="border-slate-400 text-indigo-600 focus:ring-indigo-500"
                            />
                            <Label htmlFor={`condition-${condition.id}`} className="cursor-pointer flex-1 text-slate-700">
                              {condition.name}
                            </Label>
                          </div>
                        ))}
                        {specialtyConditions.length === 0 && !isConditionLoading && (
                          <div className="text-sm text-slate-400 italic p-2">No conditions available</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="medicalNotes" className="text-slate-700 font-semibold">Medical Notes</Label>
                  <Textarea
                    id="medicalNotes"
                    name="medicalNotes"
                    value={formData.medicalNotes}
                    onChange={(e) => handleInputChange("medicalNotes", e.target.value)}
                    placeholder="Any special medical requirements or notes..."
                    rows={3}
                    className="focus-visible:ring-indigo-500 resize-none bg-slate-50/50"
                  />
                </div>

                {/* Schedule Days */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-700 font-semibold text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-500" />
                      Schedule Days & Times
                    </Label>
                    <p className="text-slate-500 text-sm mt-1">Select the specific days and corresponding times needed.</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
                    {daysOfWeek.map(day => {
                      const daySchedule = formData.scheduleDays.find(s => s.day === day);
                      const selectedTimes = daySchedule ? daySchedule.scheduleTimes : [];

                      return (
                        <div key={day}>
                          <Label className="font-medium text-slate-800 mb-3 block border-b border-slate-200 pb-2">{day}</Label>
                          <div className="flex flex-wrap gap-2">
                            {timeSlots.map(time => {
                              const isSelected = selectedTimes.includes(time);
                              return (
                                <div
                                  key={`${day}-${time}`}
                                  onClick={() => {
                                    const newTimes = isSelected
                                      ? selectedTimes.filter(t => t !== time)
                                      : [...selectedTimes, time];
                                    handleScheduleDayChange(day, newTimes);
                                  }}
                                  className={`cursor-pointer select-none transition-all duration-200 px-3 py-1.5 rounded-md text-sm font-medium border flex items-center gap-2 ${isSelected
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                                    }`}
                                >
                                  <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : "bg-slate-300"
                                    }`}></div>
                                  {time}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer / Navigation */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center flex-shrink-0 z-10">
          <Button
            type="button"
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 1 || isLoading}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 font-medium"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid() || isLoading}
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 px-8 transition-all"
            >
              Next Step
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={!isStepValid() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 px-8 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Opportunity
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}