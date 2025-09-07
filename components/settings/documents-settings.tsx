"use client";

import React, { useState, useCallback } from "react";
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
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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

  const stats = getDocumentStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <FileText className="h-6 w-6 text-[#00C2CB]" />
        <div>
          <h3 className="text-lg font-semibold">Certifications & Documents</h3>
          <p className="text-sm text-gray-500">
            Manage your professional credentials and certifications
          </p>
        </div>
      </div>

      {/* Document Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Documents</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            <div className="text-sm text-gray-500">Verified</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <div className="text-sm text-gray-500">Expired</div>
          </CardContent>
        </Card>
      </div>

      {/* Upload New Document */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload New Document</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFileUpload)} className="space-y-4">
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-[#00C2CB] bg-[#00C2CB]/5"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your file here, or{" "}
                <label className="text-[#00C2CB] cursor-pointer hover:underline">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </label>
              </p>
              <p className="text-xs text-gray-400">
                PDF, JPG, PNG files up to 10MB
              </p>
              
              {watch("file") && (
                <div className="mt-3 text-sm text-gray-600">
                  Selected: {watch("file").name} ({formatFileSize(watch("file").size)})
                </div>
              )}
            </div>
            
            {errors.file && (
              <p className="text-sm text-red-500">{errors.file.message}</p>
            )}

            {/* Document Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <Select onValueChange={(value) => setValue("documentType", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Certificate">Certificate</SelectItem>
                    <SelectItem value="License">License</SelectItem>
                    <SelectItem value="Qualification">Qualification</SelectItem>
                  </SelectContent>
                </Select>
                {errors.documentType && (
                  <p className="text-sm text-red-500 mt-1">{errors.documentType.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="issuer">Issuer</Label>
                <Input
                  placeholder="e.g., Red Cross, State of California"
                  {...register("issuer")}
                />
                {errors.issuer && (
                  <p className="text-sm text-red-500 mt-1">{errors.issuer.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  placeholder="e.g., United States"
                  {...register("country")}
                />
                {errors.country && (
                  <p className="text-sm text-red-500 mt-1">{errors.country.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="certificationType">Certification Type</Label>
                <Input
                  placeholder="e.g., CPR, First Aid, CNA"
                  {...register("certificationType")}
                />
                {errors.certificationType && (
                  <p className="text-sm text-red-500 mt-1">{errors.certificationType.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="certificationNumber">Certification Number</Label>
                <Input
                  placeholder="e.g., CPR123456"
                  {...register("certificationNumber")}
                />
                {errors.certificationNumber && (
                  <p className="text-sm text-red-500 mt-1">{errors.certificationNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  type="date"
                  {...register("expiryDate")}
                />
                {errors.expiryDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.expiryDate.message}</p>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <Button
              type="submit"
              disabled={isUploading || isLoading}
              className="bg-[#00C2CB] hover:bg-[#00A5AD]"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        <h4 className="font-medium">Your Documents ({documents.length})</h4>
        
        {documents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No documents uploaded yet</p>
              <p className="text-sm text-gray-400">
                Upload your first certification or document to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {documents.map((document) => (
              <Card key={document.documentId} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <h5 className="font-medium">{document.fileName}</h5>
                        {getVerificationBadge(document.verificationStatus)}
                        
                        {isDocumentExpired(document.expiryDate) && (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Type:</span>
                          <br />
                          {document.documentType}
                        </div>
                        
                        <div>
                          <span className="font-medium">Issuer:</span>
                          <br />
                          {document.issuer}
                        </div>
                        
                        <div>
                          <span className="font-medium">Certification:</span>
                          <br />
                          {document.certificationType}
                        </div>
                        
                        <div>
                          <span className="font-medium">Expires:</span>
                          <br />
                          {new Date(document.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {document.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-700">
                            <strong>Rejection Reason:</strong> {document.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(document.documentUrl, "_blank")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(document.documentUrl, "_blank")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Document</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{document.fileName}"? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteDocument(document.documentId)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
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
        )}
      </div>
    </div>
  );
}