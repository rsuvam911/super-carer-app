"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Shield,
  Award,
  Calendar,
  Building,
  Hash,
  MapPin,
  Star,
  Filter,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Document, DocumentMetadata } from "@/types/api";
import { documentSchema, DocumentFormData } from "@/lib/validation/settings-schemas";

interface DocumentsSettingsProps {
  documents: Document[];
  onUpload: (file: File, metadata: DocumentMetadata) => Promise<void>;
  onDelete: (documentId: string) => Promise<void>;
  isLoading: boolean;
}

export default function DocumentsSettings({
  documents,
  onUpload,
  onDelete,
  isLoading,
}: DocumentsSettingsProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsPerPage] = useState(3);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
  });

  // Handle file upload
  const handleFileUpload = async (data: DocumentFormData) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const metadata: DocumentMetadata = {
        documentType: data.documentType,
        issuer: data.issuer,
        country: data.country,
        certificationType: data.certificationType,
        certificationNumber: data.certificationNumber,
        expiryDate: data.expiryDate,
      };

      await onUpload(data.file, metadata);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);

      reset();
      toast.success("Document uploaded successfully");
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      toast.error("Failed to upload document");
      console.error("Upload error:", error);
    }
  };

  // Handle file drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setValue("file", e.dataTransfer.files[0]);
    }
  }, [setValue]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setValue("file", e.target.files[0]);
    }
  };

  // Delete document with confirmation
  const handleDeleteDocument = async (documentId: string) => {
    try {
      await onDelete(documentId);
      toast.success("Document deleted successfully");
    } catch (error) {
      toast.error("Failed to delete document");
      console.error("Delete error:", error);
    }
  };

  // Get verification status badge
  const getVerificationBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  // Check if document is expired
  const isDocumentExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get document status summary
  const getDocumentStats = () => {
    const total = documents.length;
    const verified = documents.filter((doc) => doc.verificationStatus.toLowerCase() === "verified").length;
    const pending = documents.filter((doc) => doc.verificationStatus.toLowerCase() === "pending").length;
    const expired = documents.filter((doc) => isDocumentExpired(doc.expiryDate)).length;

    return { total, verified, pending, expired };
  };

  // Filter documents based on search and status
  const getFilteredDocuments = () => {
    let filtered = documents;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((doc) =>
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.certificationType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      if (filterStatus === "expired") {
        filtered = filtered.filter((doc) => isDocumentExpired(doc.expiryDate));
      } else {
        filtered = filtered.filter((doc) => doc.verificationStatus.toLowerCase() === filterStatus);
      }
    }

    return filtered;
  };

  // Pagination functions
  const getPaginatedDocuments = () => {
    const filtered = getFilteredDocuments();
    const startIndex = (currentPage - 1) * documentsPerPage;
    const endIndex = startIndex + documentsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filtered = getFilteredDocuments();
    return Math.ceil(filtered.length / documentsPerPage);
  };

  const handlePageChange = (newPage: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentPage(newPage);
  };

  const handlePreviousPage = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (currentPage < getTotalPages()) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const stats = getDocumentStats();
  const filteredDocuments = getFilteredDocuments();
  const paginatedDocuments = getPaginatedDocuments();
  const totalPages = getTotalPages();

  return (
    <div className="max-w-full mx-auto space-y-8 px-2 sm:px-4">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#00C2CB]/10 to-blue-50 rounded-2xl p-8 border border-[#00C2CB]/20">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-[#00C2CB] rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Certifications & Documents</h3>
            <p className="text-gray-600 mt-1">
              Manage your professional credentials and build trust with clients
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          <div className="flex items-center space-x-2 bg-white/80 rounded-lg px-3 py-2 border border-gray-200">
            <Award className="h-4 w-4 text-[#00C2CB]" />
            <span className="text-sm font-medium text-gray-700">Professional Verification</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/80 rounded-lg px-3 py-2 border border-gray-200">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Build Credibility</span>
          </div>
        </div>
      </div>

      {/* Enhanced Document Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg ring-1 ring-gray-200 hover:ring-[#00C2CB]/30 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00C2CB] to-blue-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm font-medium text-gray-500 mt-1">Total Documents</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg ring-1 ring-gray-200 hover:ring-green-500/30 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.verified}</div>
                <div className="text-sm font-medium text-gray-500 mt-1">Verified</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg ring-1 ring-gray-200 hover:ring-yellow-500/30 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm font-medium text-gray-500 mt-1">Pending</div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg ring-1 ring-gray-200 hover:ring-red-500/30 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600">{stats.expired}</div>
                <div className="text-sm font-medium text-gray-500 mt-1">Expired</div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Upload Section */}
      <Card className="border-0 shadow-xl ring-1 ring-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#00C2CB]/5 to-blue-50 px-8 py-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#00C2CB] rounded-xl flex items-center justify-center">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Upload New Document</h4>
              <p className="text-sm text-gray-600">Add professional certifications and credentials</p>
            </div>
          </div>
        </div>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(handleFileUpload)} className="space-y-6">
            {/* Enhanced File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${dragActive
                ? "border-[#00C2CB] bg-[#00C2CB]/10 ring-4 ring-[#00C2CB]/20 scale-[1.02]"
                : "border-gray-300 hover:border-[#00C2CB]/50 hover:bg-gray-50"
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${dragActive ? "bg-[#00C2CB] text-white scale-110" : "bg-gray-100 text-gray-400"
                }`}>
                <Upload className="h-8 w-8" />
              </div>
              <h5 className="text-lg font-semibold text-gray-900 mb-2">Drop files here to upload</h5>
              <p className="text-gray-600 mb-4">
                Drag and drop your certification files, or{" "}
                <label className="text-[#00C2CB] font-medium cursor-pointer hover:text-[#00A5AD] transition-colors">
                  browse from device
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </label>
              </p>
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>PDF</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>JPG</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>PNG</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Upload className="h-4 w-4" />
                  <span>Max 10MB</span>
                </div>
              </div>

              {watch("file") && (
                <div className="mt-6 p-4 bg-[#00C2CB]/10 rounded-xl border border-[#00C2CB]/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#00C2CB] rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{watch("file").name}</div>
                      <div className="text-sm text-gray-600">{formatFileSize(watch("file").size)}</div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              )}
            </div>

            {errors.file && (
              <p className="text-sm text-red-500">{errors.file.message}</p>
            )}

            {/* Enhanced Document Metadata */}
            <div className="space-y-6">
              <h5 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building className="h-5 w-5 mr-2 text-[#00C2CB]" />
                Document Details
              </h5>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="documentType" className="flex items-center text-sm font-medium text-gray-700">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    Document Type
                  </Label>
                  <Select onValueChange={(value) => setValue("documentType", value as any)}>
                    <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-[#00C2CB]/20 focus:border-[#00C2CB]">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Certificate">🏆 Certificate</SelectItem>
                      <SelectItem value="License">📋 License</SelectItem>
                      <SelectItem value="Qualification">🎓 Qualification</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.documentType && (
                    <p className="text-sm text-red-500 mt-1">{errors.documentType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issuer" className="flex items-center text-sm font-medium text-gray-700">
                    <Building className="h-4 w-4 mr-2 text-gray-500" />
                    Issuing Organization
                  </Label>
                  <Input
                    className="h-12 rounded-xl border-gray-200 focus:ring-[#00C2CB]/20 focus:border-[#00C2CB]"
                    placeholder="e.g., Red Cross, State of California"
                    {...register("issuer")}
                  />
                  {errors.issuer && (
                    <p className="text-sm text-red-500 mt-1">{errors.issuer.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="flex items-center text-sm font-medium text-gray-700">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    Country
                  </Label>
                  <Input
                    className="h-12 rounded-xl border-gray-200 focus:ring-[#00C2CB]/20 focus:border-[#00C2CB]"
                    placeholder="e.g., United States"
                    {...register("country")}
                  />
                  {errors.country && (
                    <p className="text-sm text-red-500 mt-1">{errors.country.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificationType" className="flex items-center text-sm font-medium text-gray-700">
                    <Award className="h-4 w-4 mr-2 text-gray-500" />
                    Certification Type
                  </Label>
                  <Input
                    className="h-12 rounded-xl border-gray-200 focus:ring-[#00C2CB]/20 focus:border-[#00C2CB]"
                    placeholder="e.g., CPR, First Aid, CNA"
                    {...register("certificationType")}
                  />
                  {errors.certificationType && (
                    <p className="text-sm text-red-500 mt-1">{errors.certificationType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificationNumber" className="flex items-center text-sm font-medium text-gray-700">
                    <Hash className="h-4 w-4 mr-2 text-gray-500" />
                    Certification Number
                  </Label>
                  <Input
                    className="h-12 rounded-xl border-gray-200 focus:ring-[#00C2CB]/20 focus:border-[#00C2CB]"
                    placeholder="e.g., CPR123456"
                    {...register("certificationNumber")}
                  />
                  {errors.certificationNumber && (
                    <p className="text-sm text-red-500 mt-1">{errors.certificationNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate" className="flex items-center text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    Expiry Date
                  </Label>
                  <Input
                    type="date"
                    className="h-12 rounded-xl border-gray-200 focus:ring-[#00C2CB]/20 focus:border-[#00C2CB]"
                    {...register("expiryDate")}
                  />
                  {errors.expiryDate && (
                    <p className="text-sm text-red-500 mt-1">{errors.expiryDate.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Upload Progress */}
            {isUploading && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-[#00C2CB] rounded-lg flex items-center justify-center">
                    <Upload className="h-4 w-4 text-white animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-900">Uploading document...</span>
                      <span className="text-[#00C2CB]">{uploadProgress}%</span>
                    </div>
                  </div>
                </div>
                <Progress value={uploadProgress} className="w-full h-2" />
              </div>
            )}

            <Button
              type="submit"
              disabled={isUploading || isLoading}
              className="w-full h-14 bg-gradient-to-r from-[#00C2CB] to-blue-600 hover:from-[#00A5AD] hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <Upload className="h-5 w-5 mr-3" />
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Enhanced Documents List */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h4 className="text-xl font-semibold text-gray-900">Your Documents</h4>
            <Badge variant="outline" className="bg-[#00C2CB]/10 text-[#00C2CB] border-[#00C2CB]/20">
              {filteredDocuments.length} of {documents.length}
            </Badge>
            {totalPages > 1 && (
              <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                Page {currentPage} of {totalPages}
              </Badge>
            )}
          </div>

          {documents.length > 0 && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 h-10 rounded-xl border-gray-200 focus:ring-[#00C2CB]/20 focus:border-[#00C2CB]"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 h-10 rounded-xl border-gray-200 focus:ring-[#00C2CB]/20 focus:border-[#00C2CB]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {filteredDocuments.length === 0 ? (
          <Card className="border-0 shadow-lg ring-1 ring-gray-200 rounded-2xl">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h5 className="text-lg font-semibold text-gray-900 mb-2">
                {documents.length === 0 ? "No documents uploaded yet" : "No documents match your search"}
              </h5>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {documents.length === 0
                  ? "Upload your first certification or document to get started and build trust with clients"
                  : "Try adjusting your search terms or filters to find the documents you're looking for"
                }
              </p>
              {documents.length === 0 && (
                <Button
                  onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                  className="bg-[#00C2CB] hover:bg-[#00A5AD] rounded-xl"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First Document
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6">
              {paginatedDocuments.map((document) => (
                <Card key={document.documentId} className="border-0 shadow-lg ring-1 ring-gray-200 hover:ring-[#00C2CB]/30 transition-all duration-300 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-[#00C2CB]/10 rounded-xl flex items-center justify-center">
                            <FileText className="h-6 w-6 text-[#00C2CB]" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-lg font-semibold text-gray-900 mb-1">{document.fileName}</h5>
                            <div className="flex items-center space-x-3">
                              {getVerificationBadge(document.verificationStatus)}
                              {isDocumentExpired(document.expiryDate) && (
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Expired
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                              <FileText className="h-3 w-3 mr-1" />
                              Type
                            </div>
                            <div className="text-sm font-medium text-gray-900">{document.documentType}</div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                              <Building className="h-3 w-3 mr-1" />
                              Issuer
                            </div>
                            <div className="text-sm font-medium text-gray-900">{document.issuer}</div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                              <Award className="h-3 w-3 mr-1" />
                              Certification
                            </div>
                            <div className="text-sm font-medium text-gray-900">{document.certificationType}</div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                              <Calendar className="h-3 w-3 mr-1" />
                              Expires
                            </div>
                            <div className={`text-sm font-medium ${isDocumentExpired(document.expiryDate) ? 'text-red-600' : 'text-gray-900'
                              }`}>
                              {new Date(document.expiryDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {document.rejectionReason && (
                          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <h6 className="font-medium text-red-900 mb-1">Rejection Reason</h6>
                                <p className="text-sm text-red-700">{document.rejectionReason}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-6">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(document.documentUrl, "_blank")}
                          className="h-10 w-10 rounded-xl border-gray-200 hover:border-[#00C2CB] hover:text-[#00C2CB] transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(document.documentUrl, "_blank")}
                          className="h-10 w-10 rounded-xl border-gray-200 hover:border-[#00C2CB] hover:text-[#00C2CB] transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-10 w-10 rounded-xl border-gray-200 hover:border-red-500 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </div>
                                <span>Delete Document</span>
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600">
                                Are you sure you want to delete <strong>"{document.fileName}"</strong>?
                                This action cannot be undone and will permanently remove the document from your profile.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteDocument(document.documentId)}
                                className="bg-red-500 hover:bg-red-600 rounded-xl"
                              >
                                Delete Document
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * documentsPerPage + 1} to {Math.min(currentPage * documentsPerPage, filteredDocuments.length)} of {filteredDocuments.length} documents
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="h-9 w-9 rounded-lg border-gray-200 hover:border-[#00C2CB] hover:text-[#00C2CB] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current page
                      const shouldShow =
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1);

                      if (!shouldShow) {
                        // Show ellipsis for gaps
                        if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="px-2 py-1 text-gray-400 text-sm">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={(e) => handlePageChange(page, e)}
                          className={`h-9 w-9 rounded-lg transition-colors ${currentPage === page
                            ? "bg-[#00C2CB] text-white border-[#00C2CB] hover:bg-[#00A5AD]"
                            : "border-gray-200 hover:border-[#00C2CB] hover:text-[#00C2CB]"
                            }`}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="h-9 w-9 rounded-lg border-gray-200 hover:border-[#00C2CB] hover:text-[#00C2CB] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
