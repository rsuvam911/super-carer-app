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
    <div className="w-full max-w-[96rem] mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Compact Header with Statistics */}
      <div className="bg-gradient-to-br from-[#00C2CB] to-blue-600 rounded-2xl p-7 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Document Management</h3>
              <p className="text-white/80 text-base mt-1">Manage your professional credentials and certifications</p>
            </div>
          </div>

          {/* Inline Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-white/70">Total Documents</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
              <div className="text-2xl font-bold text-green-300">{stats.verified}</div>
              <div className="text-sm text-white/70">Verified</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
              <div className="text-2xl font-bold text-yellow-300">{stats.pending}</div>
              <div className="text-sm text-white/70">Pending</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
              <div className="text-2xl font-bold text-red-300">{stats.expired}</div>
              <div className="text-sm text-white/70">Expired</div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Upload Section */}
      <Card className="border-0 shadow-lg ring-1 ring-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-7 py-5 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-[#00C2CB] to-blue-600 rounded-lg flex items-center justify-center">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Upload Document</h4>
              <p className="text-sm text-gray-600">Add professional certifications and credentials</p>
            </div>
          </div>
        </div>
        <CardContent className="p-7">
          <form onSubmit={handleSubmit(handleFileUpload)} className="space-y-6">
            {/* Compact File Upload */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-7 text-center transition-all duration-300 ${dragActive
                ? "border-[#00C2CB] bg-[#00C2CB]/5 ring-2 ring-[#00C2CB]/20"
                : "border-gray-300 hover:border-[#00C2CB]/50 hover:bg-gray-50"
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${dragActive ? "bg-[#00C2CB] text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                  <Upload className="h-7 w-7" />
                </div>
                <div className="text-center">
                  <p className="text-base font-medium text-gray-900 mb-2">
                    Drop files here or{" "}
                    <label className="text-[#00C2CB] cursor-pointer hover:text-[#00A5AD] underline">
                      browse from device
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">PDF, JPG, PNG files up to 10MB</p>
                </div>
              </div>

              {watch("file") && (
                <div className="mt-3 p-3 bg-[#00C2CB]/10 rounded-lg border border-[#00C2CB]/20">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-[#00C2CB]" />
                    <div className="flex-1 text-left text-sm">
                      <div className="font-medium text-gray-900 truncate">{watch("file").name}</div>
                      <div className="text-xs text-gray-600">{formatFileSize(watch("file").size)}</div>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              )}
            </div>

            {errors.file && (
              <p className="text-sm text-red-500">{errors.file.message}</p>
            )}

            {/* Form Fields - Compact Height */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">Document Type</Label>
                <Select onValueChange={(value) => setValue("documentType", value as any)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Certificate">Certificate</SelectItem>
                    <SelectItem value="License">License</SelectItem>
                    <SelectItem value="Qualification">Qualification</SelectItem>
                  </SelectContent>
                </Select>
                {errors.documentType && <p className="text-xs text-red-500 mt-1">{errors.documentType.message}</p>}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">Issuing Organization</Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="e.g., Red Cross"
                  {...register("issuer")}
                />
                {errors.issuer && <p className="text-xs text-red-500 mt-1">{errors.issuer.message}</p>}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">Country</Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="e.g., United States"
                  {...register("country")}
                />
                {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country.message}</p>}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">Certification Type</Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="e.g., CPR, First Aid"
                  {...register("certificationType")}
                />
                {errors.certificationType && <p className="text-xs text-red-500 mt-1">{errors.certificationType.message}</p>}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">Certification Number</Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="e.g., CPR123456"
                  {...register("certificationNumber")}
                />
                {errors.certificationNumber && <p className="text-xs text-red-500 mt-1">{errors.certificationNumber.message}</p>}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">Expiry Date</Label>
                <Input
                  type="date"
                  className="h-9 text-sm"
                  {...register("expiryDate")}
                />
                {errors.expiryDate && <p className="text-xs text-red-500 mt-1">{errors.expiryDate.message}</p>}
              </div>
            </div>

            {/* Upload Progress - Compact */}
            {isUploading && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-3 mb-2">
                  <Upload className="h-4 w-4 text-[#00C2CB] animate-pulse" />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-900">Uploading...</span>
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
              className="w-full h-10 bg-gradient-to-r from-[#00C2CB] to-blue-600 hover:from-[#00A5AD] hover:to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Compact Documents List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h4 className="text-lg font-semibold text-gray-900">Documents</h4>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full h-9 rounded-lg border-gray-200 focus:ring-[#00C2CB]/20 focus:border-[#00C2CB] text-sm"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-32 h-9 rounded-lg border-gray-200 focus:ring-[#00C2CB]/20 focus:border-[#00C2CB] text-sm">
                  <Filter className="h-3 w-3 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {
          filteredDocuments.length === 0 ? (
            <Card className="border-0 shadow-lg ring-1 ring-gray-200 rounded-2xl">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h5 className="text-lg font-semibold text-gray-900 mb-2">
                  {documents.length === 0 ? "No documents uploaded" : "No matches found"}
                </h5>
                <p className="text-gray-600 mb-4 max-w-md mx-auto text-sm">
                  {documents.length === 0
                    ? "Upload your first certification to get started"
                    : "Try adjusting your search or filters"
                  }
                </p>
                {documents.length === 0 && (
                  <Button
                    onClick={() => {
                      const uploadForm = document.querySelector('#upload-form') as HTMLElement;
                      if (uploadForm) uploadForm.style.display = 'block';
                    }}
                    className="bg-[#00C2CB] hover:bg-[#00A5AD] rounded-lg text-sm"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedDocuments.map((document) => (
                  <Card key={document.documentId} className="border-0 shadow-md ring-1 ring-gray-200 hover:ring-[#00C2CB]/30 transition-all duration-300 rounded-xl overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#00C2CB] to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="font-semibold text-gray-900 truncate text-sm">{document.fileName}</h5>
                              {getVerificationBadge(document.verificationStatus)}
                              {isDocumentExpired(document.expiryDate) && (
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Expired
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
                              <div>
                                <span className="font-medium">{document.documentType}</span>
                              </div>
                              <div className="truncate">
                                <span>by {document.issuer}</span>
                              </div>
                              <div className="truncate">
                                <span>{document.certificationType}</span>
                              </div>
                              <div className={isDocumentExpired(document.expiryDate) ? 'text-red-600 font-medium' : ''}>
                                <span>Expires {new Date(document.expiryDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(document.documentUrl, "_blank")}
                                  className="h-8 w-8 rounded-lg border-gray-200 hover:border-[#00C2CB] hover:text-[#00C2CB] transition-colors"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View document</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(document.documentUrl, "_blank")}
                                  className="h-8 w-8 rounded-lg border-gray-200 hover:border-[#00C2CB] hover:text-[#00C2CB] transition-colors"
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Download document</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 rounded-lg border-gray-200 hover:border-red-500 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
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
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteDocument(document.documentId)}
                                  className="bg-red-500 hover:bg-red-600 rounded-xl"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {document.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h6 className="font-medium text-red-900 text-sm">Rejection Reason</h6>
                              <p className="text-sm text-red-700">{document.rejectionReason}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Compact Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-600 text-center sm:text-left">
                    Showing {(currentPage - 1) * documentsPerPage + 1}-{Math.min(currentPage * documentsPerPage, filteredDocuments.length)} of {filteredDocuments.length}
                  </div>

                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="h-8 w-8 rounded-lg border-gray-200 hover:border-[#00C2CB] hover:text-[#00C2CB] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        const shouldShow =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1);

                        if (!shouldShow) {
                          if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <span key={page} className="px-1 py-1 text-gray-400 text-xs">
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
                            className={`h-8 w-8 rounded-lg transition-colors text-xs ${currentPage === page
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
                      className="h-8 w-8 rounded-lg border-gray-200 hover:border-[#00C2CB] hover:text-[#00C2CB] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )
        }
      </div>
    </div>
  );
}
