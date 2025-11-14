"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  CreditCard,
  Globe,
  Shield,
  Briefcase,
  FileText,
  MapPin,
  Calendar,
  Star,
  Award,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import ProviderService from "@/services/providerService";
import {
  ProviderProfileDetails,
  ProviderCategory,
  Document,
} from "@/types/api";
import CareCategoriesSettings from "@/components/settings/care-categories-settings";
import DocumentsSettings from "@/components/settings/documents-settings";
import { useAuth } from "@/lib/auth-context";

// Enhanced settings tab type
type SettingsTab =
  | "profile"
  | "categories"
  | "documents"
  | "notifications"
  | "payment"
  | "security";

export default function SettingsPage() {
  const { user, userRole, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [profileData, setProfileData] = useState<ProviderProfileDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch provider profile data when user is authenticated and has provider role
  useEffect(() => {
    if (
      isAuthenticated &&
      user?.userId &&
      userRole === "care-provider" &&
      !authLoading
    ) {
      fetchProviderProfile(user.userId);
    } else if (!authLoading && !isAuthenticated) {
      setError("Please log in to view your settings");
      setIsLoading(false);
    } else if (!authLoading && userRole !== "care-provider") {
      setError("Access denied: This page is for care providers only");
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.userId, userRole, authLoading]);

  const fetchProviderProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ProviderService.getProviderProfile(userId);
      if (response.success) {
        setProfileData(response.payload);
      } else {
        setError(response.message || "Failed to load profile data");
        toast.error("Failed to load profile data");
      }
    } catch (error: any) {
      console.error("Error fetching provider profile:", error);
      setError("Failed to load profile data");
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle category updates
  const handleCategoriesUpdate = async (categories: ProviderCategory[]) => {
    if (!profileData) return;

    try {
      await ProviderService.updateProviderCategories(
        profileData.providerId,
        categories
      );
      setProfileData((prev) => (prev ? { ...prev, categories } : null));
      toast.success("Categories updated successfully");
    } catch (error: any) {
      console.error("Error updating categories:", error);
      throw error;
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (file: File, metadata: any) => {
    if (!profileData || !user?.userId) return;

    try {
      console.log("[Settings] Uploading document for user:", user.userId);
      const response = await ProviderService.uploadDocument(
        user.userId,
        file,
        metadata
      );
      if (response.success) {
        setProfileData((prev) =>
          prev
            ? {
                ...prev,
                documents: [...prev.documents, response.payload],
              }
            : null
        );
        toast.success("Document uploaded successfully");
      } else {
        toast.error(response.message || "Failed to upload document");
      }
    } catch (error: any) {
      console.error("[Settings] Error uploading document:", error);
      toast.error(error.response?.data?.message || "Failed to upload document");
      throw error;
    }
  };

  // Handle document deletion
  const handleDocumentDelete = async (documentId: string) => {
    if (!profileData) return;

    try {
      await ProviderService.deleteDocument(documentId);
      setProfileData((prev) =>
        prev
          ? {
              ...prev,
              documents: prev.documents.filter(
                (doc) => doc.documentId !== documentId
              ),
            }
          : null
      );
      toast.success("Document deleted successfully");
    } catch (error: any) {
      console.error("Error deleting document:", error);
      throw error;
    }
  };

  const renderTabContent = () => {
    // Show loading if auth is still loading
    if (authLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0DA2A4]"></div>
          <span className="ml-2">Authenticating...</span>
        </div>
      );
    }

    // Show error if not authenticated or wrong role
    if (!isAuthenticated || !user) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">
            Please log in to access your settings
          </p>
        </div>
      );
    }

    if (userRole !== "care-provider") {
      return (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">
            Access denied: This page is for care providers only
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0DA2A4]"></div>
          <span className="ml-2">Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          {user?.userId ? (
            <button
              type="button"
              onClick={() => fetchProviderProfile(user.userId)}
              className="bg-[#0DA2A4] text-white px-4 py-2 rounded-md hover:bg-[#0C8F91]"
            >
              Retry
            </button>
          ) : (
            <p className="text-sm text-gray-500">Please log in to retry</p>
          )}
        </div>
      );
    }

    if (!profileData) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No profile data available</p>
        </div>
      );
    }

    switch (activeTab) {
      case "profile":
        return <ProfileSettings profileData={profileData} />;
      case "categories":
        return (
          <CareCategoriesSettings
            categories={profileData.categories}
            onUpdate={handleCategoriesUpdate}
            isLoading={isLoading}
            profileData={profileData}
          />
        );
      case "documents":
        return (
          <DocumentsSettings
            documents={profileData.documents}
            onUpload={handleDocumentUpload}
            onDelete={handleDocumentDelete}
            isLoading={isLoading}
          />
        );
      case "notifications":
        return <NotificationSettings />;
      case "payment":
        return <PaymentSettings />;
      case "security":
        return <SecuritySettings />;
      default:
        return <ProfileSettings profileData={profileData} />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-4 text-sm font-medium flex items-center ${
              activeTab === "profile"
                ? "text-[#0DA2A4] border-b-2 border-[#0DA2A4]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`px-6 py-4 text-sm font-medium flex items-center ${
              activeTab === "categories"
                ? "text-[#0DA2A4] border-b-2 border-[#0DA2A4]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Care Categories
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`px-6 py-4 text-sm font-medium flex items-center ${
              activeTab === "documents"
                ? "text-[#0DA2A4] border-b-2 border-[#0DA2A4]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-6 py-4 text-sm font-medium flex items-center ${
              activeTab === "notifications"
                ? "text-[#0DA2A4] border-b-2 border-[#0DA2A4]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </button>

          <button
            onClick={() => setActiveTab("payment")}
            className={`px-6 py-4 text-sm font-medium flex items-center ${
              activeTab === "payment"
                ? "text-[#0DA2A4] border-b-2 border-[#0DA2A4]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Payment
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`px-6 py-4 text-sm font-medium flex items-center ${
              activeTab === "security"
                ? "text-[#0DA2A4] border-b-2 border-[#0DA2A4]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Shield className="h-4 w-4 mr-2" />
            Security
          </button>
        </div>

        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
}

function ProfileSettings({
  profileData,
}: {
  profileData: ProviderProfileDetails;
}) {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profileData.firstName || "",
    lastName: profileData.lastName || "",
    email: profileData.email || "",
    phoneNumber: profileData.phoneNumber || "",
    gender: profileData.gender || "",
    dateOfBirth: profileData.dateOfBirth
      ? new Date(profileData.dateOfBirth).toISOString().split("T")[0]
      : "",
    yearsExperience: profileData.yearsExperience || 0,
    bio: profileData.bio || "",
    providesOvernight: profileData.providesOvernight || false,
    providesLiveIn: profileData.providesLiveIn || false,
    streetAddress: profileData.primaryAddress?.streetAddress || "",
    city: profileData.primaryAddress?.city || "",
    state: profileData.primaryAddress?.state || "",
    postalCode: profileData.primaryAddress?.postalCode || "",
    preferredCurrency: profileData.preferredCurrency || "",
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  // Sync form data when profileData changes (e.g., after API fetch)
  useEffect(() => {
    console.log("[Profile Settings] ProfileData updated:", profileData);
    console.log(
      "[Profile Settings] PreferredCurrency from API:",
      profileData.preferredCurrency
    );

    setFormData({
      firstName: profileData.firstName || "",
      lastName: profileData.lastName || "",
      email: profileData.email || "",
      phoneNumber: profileData.phoneNumber || "",
      gender: profileData.gender || "",
      dateOfBirth: profileData.dateOfBirth
        ? new Date(profileData.dateOfBirth).toISOString().split("T")[0]
        : "",
      yearsExperience: profileData.yearsExperience || 0,
      bio: profileData.bio || "",
      providesOvernight: profileData.providesOvernight || false,
      providesLiveIn: profileData.providesLiveIn || false,
      streetAddress: profileData.primaryAddress?.streetAddress || "",
      city: profileData.primaryAddress?.city || "",
      state: profileData.primaryAddress?.state || "",
      postalCode: profileData.primaryAddress?.postalCode || "",
      preferredCurrency: profileData.preferredCurrency || "",
    });
  }, [profileData]);

  // Stripe accepted currencies with full names
  const CURRENCIES = [
    { code: "USD", name: "United States Dollar" },
    { code: "AED", name: "United Arab Emirates Dirham" },
    { code: "AFN", name: "Afghan Afghani" },
    { code: "ALL", name: "Albanian Lek" },
    { code: "AMD", name: "Armenian Dram" },
    { code: "ANG", name: "Netherlands Antillean Guilder" },
    { code: "AOA", name: "Angolan Kwanza" },
    { code: "ARS", name: "Argentine Peso" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "AWG", name: "Aruban Florin" },
    { code: "AZN", name: "Azerbaijani Manat" },
    { code: "BAM", name: "Bosnia-Herzegovina Convertible Mark" },
    { code: "BBD", name: "Barbadian Dollar" },
    { code: "BDT", name: "Bangladeshi Taka" },
    { code: "BGN", name: "Bulgarian Lev" },
    { code: "BIF", name: "Burundian Franc" },
    { code: "BMD", name: "Bermudan Dollar" },
    { code: "BND", name: "Brunei Dollar" },
    { code: "BOB", name: "Bolivian Boliviano" },
    { code: "BRL", name: "Brazilian Real" },
    { code: "BSD", name: "Bahamian Dollar" },
    { code: "BWP", name: "Botswanan Pula" },
    { code: "BYN", name: "Belarusian Ruble" },
    { code: "BZD", name: "Belize Dollar" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "CDF", name: "Congolese Franc" },
    { code: "CHF", name: "Swiss Franc" },
    { code: "CLP", name: "Chilean Peso" },
    { code: "CNY", name: "Chinese Yuan" },
    { code: "COP", name: "Colombian Peso" },
    { code: "CRC", name: "Costa Rican Colón" },
    { code: "CVE", name: "Cape Verdean Escudo" },
    { code: "CZK", name: "Czech Koruna" },
    { code: "DJF", name: "Djiboutian Franc" },
    { code: "DKK", name: "Danish Krone" },
    { code: "DOP", name: "Dominican Peso" },
    { code: "DZD", name: "Algerian Dinar" },
    { code: "EGP", name: "Egyptian Pound" },
    { code: "ETB", name: "Ethiopian Birr" },
    { code: "EUR", name: "Euro" },
    { code: "FJD", name: "Fijian Dollar" },
    { code: "FKP", name: "Falkland Islands Pound" },
    { code: "GBP", name: "British Pound Sterling" },
    { code: "GEL", name: "Georgian Lari" },
    { code: "GIP", name: "Gibraltar Pound" },
    { code: "GMD", name: "Gambian Dalasi" },
    { code: "GNF", name: "Guinean Franc" },
    { code: "GTQ", name: "Guatemalan Quetzal" },
    { code: "GYD", name: "Guyanaese Dollar" },
    { code: "HKD", name: "Hong Kong Dollar" },
    { code: "HNL", name: "Honduran Lempira" },
    { code: "HTG", name: "Haitian Gourde" },
    { code: "HUF", name: "Hungarian Forint" },
    { code: "IDR", name: "Indonesian Rupiah" },
    { code: "ILS", name: "Israeli New Shekel" },
    { code: "INR", name: "Indian Rupee" },
    { code: "ISK", name: "Icelandic Króna" },
    { code: "JMD", name: "Jamaican Dollar" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "KES", name: "Kenyan Shilling" },
    { code: "KGS", name: "Kyrgystani Som" },
    { code: "KHR", name: "Cambodian Riel" },
    { code: "KMF", name: "Comorian Franc" },
    { code: "KRW", name: "South Korean Won" },
    { code: "KYD", name: "Cayman Islands Dollar" },
    { code: "KZT", name: "Kazakhstani Tenge" },
    { code: "LAK", name: "Laotian Kip" },
    { code: "LBP", name: "Lebanese Pound" },
    { code: "LKR", name: "Sri Lankan Rupee" },
    { code: "LRD", name: "Liberian Dollar" },
    { code: "LSL", name: "Lesotho Loti" },
    { code: "MAD", name: "Moroccan Dirham" },
    { code: "MDL", name: "Moldovan Leu" },
    { code: "MGA", name: "Malagasy Ariary" },
    { code: "MKD", name: "Macedonian Denar" },
    { code: "MMK", name: "Myanma Kyat" },
    { code: "MNT", name: "Mongolian Tugrik" },
    { code: "MOP", name: "Macanese Pataca" },
    { code: "MUR", name: "Mauritian Rupee" },
    { code: "MVR", name: "Maldivian Rufiyaa" },
    { code: "MWK", name: "Malawian Kwacha" },
    { code: "MXN", name: "Mexican Peso" },
    { code: "MYR", name: "Malaysian Ringgit" },
    { code: "MZN", name: "Mozambican Metical" },
    { code: "NAD", name: "Namibian Dollar" },
    { code: "NGN", name: "Nigerian Naira" },
    { code: "NIO", name: "Nicaraguan Córdoba" },
    { code: "NOK", name: "Norwegian Krone" },
    { code: "NPR", name: "Nepalese Rupee" },
    { code: "NZD", name: "New Zealand Dollar" },
    { code: "PAB", name: "Panamanian Balboa" },
    { code: "PEN", name: "Peruvian Nuevo Sol" },
    { code: "PGK", name: "Papua New Guinean Kina" },
    { code: "PHP", name: "Philippine Peso" },
    { code: "PKR", name: "Pakistani Rupee" },
    { code: "PLN", name: "Polish Zloty" },
    { code: "PYG", name: "Paraguayan Guarani" },
    { code: "QAR", name: "Qatari Rial" },
    { code: "RON", name: "Romanian Leu" },
    { code: "RSD", name: "Serbian Dinar" },
    { code: "RUB", name: "Russian Ruble" },
    { code: "RWF", name: "Rwandan Franc" },
    { code: "SAR", name: "Saudi Riyal" },
    { code: "SBD", name: "Solomon Islands Dollar" },
    { code: "SCR", name: "Seychellois Rupee" },
    { code: "SEK", name: "Swedish Krona" },
    { code: "SGD", name: "Singapore Dollar" },
    { code: "SHP", name: "Saint Helena Pound" },
    { code: "SLE", name: "Sierra Leonean Leone" },
    { code: "SOS", name: "Somali Shilling" },
    { code: "SRD", name: "Surinamese Dollar" },
    { code: "STD", name: "São Tomé and Príncipe Dobra" },
    { code: "SZL", name: "Swazi Lilangeni" },
    { code: "THB", name: "Thai Baht" },
    { code: "TJS", name: "Tajikistani Somoni" },
    { code: "TOP", name: "Tongan Paʻanga" },
    { code: "TRY", name: "Turkish Lira" },
    { code: "TTD", name: "Trinidad and Tobago Dollar" },
    { code: "TWD", name: "New Taiwan Dollar" },
    { code: "TZS", name: "Tanzanian Shilling" },
    { code: "UAH", name: "Ukrainian Hryvnia" },
    { code: "UGX", name: "Ugandan Shilling" },
    { code: "UYU", name: "Uruguayan Peso" },
    { code: "UZS", name: "Uzbekistan Som" },
    { code: "VND", name: "Vietnamese Dong" },
    { code: "VUV", name: "Vanuatu Vatu" },
    { code: "WST", name: "Samoan Tala" },
    { code: "XAF", name: "Central African CFA Franc" },
    { code: "XCD", name: "East Caribbean Dollar" },
    { code: "XOF", name: "West African CFA Franc" },
    { code: "XPF", name: "CFP Franc" },
    { code: "YER", name: "Yemeni Rial" },
    { code: "ZAR", name: "South African Rand" },
    { code: "ZMW", name: "Zambian Kwacha" },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      { field: "firstName", label: "First Name" },
      { field: "lastName", label: "Last Name" },
      { field: "email", label: "Email" },
      { field: "phoneNumber", label: "Phone Number" },
      { field: "gender", label: "Gender" },
      { field: "dateOfBirth", label: "Date of Birth" },
      { field: "streetAddress", label: "Street Address" },
      { field: "city", label: "City" },
      { field: "state", label: "State" },
      { field: "postalCode", label: "Postal Code" },
    ];

    const missingFields = requiredFields.filter(({ field }) => {
      const value = formData[field as keyof typeof formData];
      return !value || value.toString().trim() === "";
    });

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(({ label }) => label).join(", ");
      toast.error(
        `Please fill in the following required fields: ${fieldNames}`
      );
      return false;
    }

    return true;
  };

  const handleSaveChanges = async () => {
    if (!user?.userId) {
      console.error("[Profile Update] User not authenticated");
      toast.error("User not authenticated");
      return;
    }

    if (!validateForm()) {
      console.warn("[Profile Update] Form validation failed");
      return;
    }

    setIsUpdating(true);
    console.log(
      "[Profile Update] Starting profile update for user:",
      user.userId
    );

    try {
      const updateData = {
        FirstName: formData.firstName,
        LastName: formData.lastName,
        Email: formData.email,
        PhoneNumber: formData.phoneNumber,
        Gender: formData.gender,
        DateOfBirth: formData.dateOfBirth,
        YearsExperience: formData.yearsExperience,
        Bio: formData.bio,
        ProvidesOvernight: formData.providesOvernight,
        ProvidesLiveIn: formData.providesLiveIn,
        PreferredCurrency: formData.preferredCurrency,
        PrimaryAddress: {
          StreetAddress: formData.streetAddress,
          City: formData.city,
          State: formData.state,
          PostalCode: formData.postalCode,
          Label: "",
          Latitude: "",
          Longitude: "",
        },
        ProfilePicture: profilePicture || undefined,
        BufferDuration: "",
      };

      console.log("[Profile Update] Sending update data:", updateData);

      const response = await ProviderService.updateProviderProfile(
        user.userId,
        updateData
      );

      console.log("[Profile Update] API Response:", response);

      if (response.success) {
        console.log("[Profile Update] Profile updated successfully");
        toast.success("Profile updated successfully!");
        // Only refresh on success
        window.location.reload();
      } else {
        console.error("[Profile Update] Update failed:", response.message);
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("[Profile Update] Exception caught:", error);
      console.error("[Profile Update] Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
      console.log("[Profile Update] Update process completed");
    }
  };
  return (
    <div className="max-w-full mx-auto space-y-6 md:space-y-8 lg:space-y-10 px-2 sm:px-4">
      {/* Profile Header Section */}
      <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden ring-4 ring-[#0DA2A4]/10">
              <img
                src={
                  profileData.profilePictureUrl ||
                  "/placeholder.svg?height=112&width=112"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#0DA2A4] rounded-full p-2 shadow-lg">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">{`${profileData.firstName} ${profileData.lastName}`}</h2>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <div className="flex items-center justify-center md:justify-start">
                <Award className="h-4 w-4 mr-2 text-[#0DA2A4]" />
                <span className="text-gray-600">Professional Caregiver</span>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                <Star className="h-4 w-4 mr-2 text-[#0DA2A4]" />
                <span className="text-gray-600">
                  {profileData.yearsExperience} years experience
                </span>
              </div>
            </div>
            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
              {profileData.bio || "No bio available"}
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="profile-picture-upload"
            />
            <label
              htmlFor="profile-picture-upload"
              className="bg-[#0DA2A4] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#0C8F91] transition-colors cursor-pointer text-center"
            >
              Upload New Photo
            </label>
            <button
              type="button"
              onClick={() => setProfilePicture(null)}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Remove Photo
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Personal Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-[#0DA2A4]" />
              Personal Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.firstName + " " + formData.lastName}
                    onChange={(e) => {
                      const names = e.target.value.split(" ");
                      handleInputChange("firstName", names[0] || "");
                      handleInputChange(
                        "lastName",
                        names.slice(1).join(" ") || ""
                      );
                    }}
                    className="pl-8 sm:pl-10 pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4]/20 focus:border-[#0DA2A4] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-8 sm:pl-10 pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4]/20 focus:border-[#0DA2A4] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    className="pl-8 sm:pl-10 pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4]/20 focus:border-[#0DA2A4] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4]/20 focus:border-[#0DA2A4] transition-colors bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Years of Experience
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.yearsExperience}
                    onChange={(e) =>
                      handleInputChange(
                        "yearsExperience",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="pl-8 sm:pl-10 pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4]/20 focus:border-[#0DA2A4] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    className="pl-8 sm:pl-10 pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4]/20 focus:border-[#0DA2A4] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Currency
                  {formData.preferredCurrency && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Cannot be changed once set)
                    </span>
                  )}
                </label>
                <select
                  value={formData.preferredCurrency}
                  onChange={(e) =>
                    handleInputChange("preferredCurrency", e.target.value)
                  }
                  disabled={!!formData.preferredCurrency}
                  className={`px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4]/20 focus:border-[#0DA2A4] transition-colors ${
                    formData.preferredCurrency
                      ? "bg-gray-100 cursor-not-allowed opacity-60"
                      : "bg-white"
                  }`}
                >
                  <option value="">Select Currency</option>
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                {!formData.preferredCurrency && (
                  <p className="text-xs text-amber-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    Once set, this cannot be changed. Choose carefully.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Address Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-[#0DA2A4]" />
              Address Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="sm:col-span-2 lg:col-span-3 space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) =>
                    handleInputChange("streetAddress", e.target.value)
                  }
                  className="px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4]/20 focus:border-[#0DA2A4] transition-colors"
                  placeholder="Enter your street address"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4]/20 focus:border-[#0DA2A4] transition-colors"
                  placeholder="Enter your city"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  State/Province
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4]/20 focus:border-[#0DA2A4] transition-colors"
                  placeholder="Enter your state/province"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleInputChange("postalCode", e.target.value)
                  }
                  className="px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4]/20 focus:border-[#0DA2A4] transition-colors"
                  placeholder="Enter your postal code"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-[#0DA2A4]" />
              Professional Bio
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Tell us about yourself
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="p-3 sm:p-4 md:p-5 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4]/20 focus:border-[#0DA2A4] transition-colors resize-none"
                placeholder="Share your experience, specialties, and what makes you a great caregiver..."
              />
              <p className="text-xs text-gray-500">Maximum 500 characters</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isUpdating}
            className="flex-1 bg-[#0DA2A4] text-white py-3 px-6 rounded-xl font-medium hover:bg-[#0C8F91] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Saving Changes..." : "Save All Changes"}
          </button>
          <button
            type="button"
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium">Email Notifications</h4>
            <p className="text-sm text-gray-500">
              Receive email notifications for new bookings, updates, and
              messages
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0DA2A4]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0DA2A4]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium">SMS Notifications</h4>
            <p className="text-sm text-gray-500">
              Receive text message alerts for urgent updates and appointment
              reminders
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0DA2A4]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0DA2A4]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium">In-App Notifications</h4>
            <p className="text-sm text-gray-500">
              Receive notifications within the app for all activities
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0DA2A4]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0DA2A4]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium">Marketing Emails</h4>
            <p className="text-sm text-gray-500">
              Receive promotional emails and newsletters
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0DA2A4]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0DA2A4]"></div>
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="bg-[#0DA2A4] text-white px-6 py-2 rounded-md hover:bg-[#0C8F91] transition-colors">
          Save Preferences
        </button>
      </div>
    </div>
  );
}

function PaymentSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-4">Payment Methods</h3>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="24" height="24" rx="4" fill="#1A56DB" />
                  <path
                    d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
                    fill="#FF5F00"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Mastercard ending in 4242</h4>
                <p className="text-sm text-gray-500">Expires 04/2026</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                Default
              </span>
              <button className="text-gray-400 hover:text-gray-600">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18.5 2.5C18.7626 2.23735 19.1131 2.07731 19.5 2.07731C19.8869 2.07731 20.2374 2.23735 20.5 2.5C20.7626 2.76264 20.9227 3.11309 20.9227 3.5C20.9227 3.88691 20.7626 4.23735 20.5 4.5L12 13L9 14L10 11L18.5 2.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="24" height="24" rx="4" fill="#2D3A9E" />
                  <path d="M9 16H15V8H9V16Z" fill="#FFFFFF" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Visa ending in 1234</h4>
                <p className="text-sm text-gray-500">Expires 12/2025</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.5 2.5C18.7626 2.23735 19.1131 2.07731 19.5 2.07731C19.8869 2.07731 20.2374 2.23735 20.5 2.5C20.7626 2.76264 20.9227 3.11309 20.9227 3.5C20.9227 3.88691 20.7626 4.23735 20.5 4.5L12 13L9 14L10 11L18.5 2.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <button className="mt-4 flex items-center text-[#0DA2A4] hover:text-[#0C8F91] transition-colors">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mr-2"
        >
          <path
            d="M12 5V19M5 12H19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Add New Payment Method
      </button>

      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-medium mb-4">Billing Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Name
            </label>
            <input
              type="text"
              defaultValue="Rachel Green"
              className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Email
            </label>
            <input
              type="email"
              defaultValue="rachel.green@example.com"
              className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Address
            </label>
            <input
              type="text"
              defaultValue="123 Main St, Apt 4B"
              className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              defaultValue="New York"
              className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State / Province
            </label>
            <input
              type="text"
              defaultValue="NY"
              className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP / Postal Code
            </label>
            <input
              type="text"
              defaultValue="10001"
              className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4] focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="bg-[#0DA2A4] text-white px-6 py-2 rounded-md hover:bg-[#0C8F91] transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-4">Security Settings</h3>

      <div className="border-b border-gray-200 pb-6">
        <h4 className="font-medium mb-4">Change Password</h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4] focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters and include a number and a
              special character.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#0DA2A4] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button className="bg-[#0DA2A4] text-white px-4 py-2 rounded-md text-sm hover:bg-[#0C8F91] transition-colors">
              Update Password
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-6">
        <h4 className="font-medium mb-4">Two-Factor Authentication</h4>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Enable Two-Factor Authentication</p>
            <p className="text-sm text-gray-500">
              Add an extra layer of security to your account
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0DA2A4]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0DA2A4]"></div>
          </label>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-4">Session Management</h4>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium">Current Session</h5>
                <p className="text-sm text-gray-500">
                  New York, USA • Chrome on Windows • April 3, 2025
                </p>
              </div>
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                Active
              </span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium">Previous Session</h5>
                <p className="text-sm text-gray-500">
                  New York, USA • Safari on iPhone • April 1, 2025
                </p>
              </div>
              <button className="text-sm text-red-500">Revoke</button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button className="text-red-500 text-sm">
            Sign out of all sessions
          </button>
        </div>
      </div>
    </div>
  );
}
