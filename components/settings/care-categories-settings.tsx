"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, Save, RotateCcw, Briefcase, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProviderCategory, CareCategory, ProviderProfileDetails } from "@/types/api";
import { categorySchema } from "@/lib/validation/settings-schemas";
import type { CategoryFormData } from "@/lib/validation/settings-schemas";
import CareCategoryService from "@/services/careCategoryService";
import ProviderService from "@/services/providerService";
import { useAuth } from "@/lib/auth-context";

interface CareCategoriesSettingsProps {
  categories: ProviderCategory[];
  onUpdate: (categories: ProviderCategory[]) => Promise<void>;
  isLoading: boolean;
  profileData: ProviderProfileDetails;
}

export default function CareCategoriesSettings({
  categories,
  onUpdate,
  isLoading,
  profileData,
}: CareCategoriesSettingsProps) {
  const { user } = useAuth();
  const [localCategories, setLocalCategories] = useState<ProviderCategory[]>(categories);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<CareCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  // Fetch available care categories from API
  useEffect(() => {
    const fetchCareCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await CareCategoryService.getCareCategories(false);
        if (response.success) {
          setAvailableCategories(response.payload);
        } else {
          toast.error("Failed to load care categories");
        }
      } catch (error) {
        console.error("Error fetching care categories:", error);
        toast.error("Failed to load care categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCareCategories();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  // Add a new category
  const addCategory = async (data: CategoryFormData) => {
    if (!profileData?.providerId) {
      toast.error("Provider ID not found");
      return;
    }

    // Validate mandatory fields
    if (!data.description || data.description.trim() === "") {
      toast.error("Description is required");
      return;
    }
    if (!data.hourlyRate || data.hourlyRate <= 0) {
      toast.error("Hourly rate is required and must be greater than 0");
      return;
    }
    if (!data.experienceLevel || data.experienceLevel < 1) {
      toast.error("Experience level is required and must be at least 1");
      return;
    }

    // Find the selected care category
    const selectedCareCategory = availableCategories.find(cat => cat.name === data.categoryName);

    if (!selectedCareCategory) {
      toast.error("Please select a valid category");
      return;
    }

    setAddingCategory(true);
    try {
      // Call the API to attach the category to the provider
      const response = await ProviderService.attachCareCategory(
        profileData.providerId,
        selectedCareCategory.id,
        {
          description: data.description,
          hourlyRate: data.hourlyRate,
          experienceLevel: data.experienceLevel,
        }
      );

      if (response.success) {
        const newCategory: ProviderCategory = {
          id: selectedCareCategory.id,
          name: data.categoryName,
          hourlyRate: data.hourlyRate,
          experienceLevel: data.experienceLevel,
          description: data.description,
        };

        const updatedCategories = [...localCategories, newCategory];
        setLocalCategories(updatedCategories);
        setHasChanges(true);
        reset();
        toast.success("Category attached successfully");
      } else {
        toast.error(response.message || "Failed to attach category");
      }
    } catch (error: any) {
      console.error("Error attaching category:", error);
      toast.error(error.response?.data?.message || "Failed to attach category");
    } finally {
      setAddingCategory(false);
    }
  };

  // Update an existing category locally
  const updateCategory = (categoryId: string, field: keyof ProviderCategory, value: any) => {
    const updatedCategories = localCategories.map((cat) =>
      cat.id === categoryId ? { ...cat, [field]: value } : cat
    );
    setLocalCategories(updatedCategories);
    setHasChanges(true);
  };

  // Save individual category changes to API
  const saveCategoryChanges = async (category: ProviderCategory) => {
    if (!profileData?.providerId) {
      toast.error("Provider ID not found");
      return;
    }

    // Validate mandatory fields
    if (!category.hourlyRate || category.hourlyRate <= 0) {
      toast.error("Hourly rate is required and must be greater than 0");
      return;
    }
    if (!category.experienceLevel || category.experienceLevel < 1) {
      toast.error("Experience level is required and must be at least 1");
      return;
    }

    try {
      const response = await ProviderService.attachCareCategory(
        profileData.providerId,
        category.id,
        {
          description: category.description || "",
          hourlyRate: category.hourlyRate,
          experienceLevel: category.experienceLevel,
        }
      );

      if (response.success) {
        setEditingCategory(null);
        setHasChanges(false);
        toast.success("Category updated successfully");
      } else {
        toast.error(response.message || "Failed to update category");
      }
    } catch (error: any) {
      console.error("Error updating category:", error);
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  // Remove a category
  const removeCategory = (categoryId: string) => {
    const updatedCategories = localCategories.filter((cat) => cat.id !== categoryId);
    setLocalCategories(updatedCategories);
    setHasChanges(true);
    toast.success("Category removed");
  };

  // Save all changes to server
  const saveChanges = async () => {
    try {
      await onUpdate(localCategories);
      setHasChanges(false);
      toast.success("Categories updated successfully");
    } catch (error) {
      toast.error("Failed to update categories");
      console.error("Error updating categories:", error);
    }
  };

  // Reset to original state
  const resetChanges = () => {
    setLocalCategories(categories);
    setHasChanges(false);
    setEditingCategory(null);
    reset();
    toast.info("Changes reset");
  };

  // Get experience level label
  const getExperienceLabel = (level: number) => {
    if (level <= 2) return "Beginner";
    if (level <= 5) return "Intermediate";
    if (level <= 8) return "Advanced";
    return "Expert";
  };

  // Get categories that are not yet added and filter by search term
  const filteredAvailableCategories = availableCategories.filter(
    (cat) => {
      const notAdded = !localCategories.find((localCat) => localCat.id === cat.id);
      const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
      return notAdded && matchesSearch;
    }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Briefcase className="h-6 w-6 text-[#00C2CB]" />
        <div>
          <h3 className="text-lg font-semibold">Service Categories</h3>
          <p className="text-sm text-gray-500">
            Manage your care specializations and hourly rates
          </p>
        </div>
      </div>

      {/* Loading state for categories */}
      {loadingCategories && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C2CB] mx-auto mb-4"></div>
            <p className="text-gray-500">Loading care categories...</p>
          </CardContent>
        </Card>
      )}

      {/* No available categories state */}
      {!loadingCategories && filteredAvailableCategories.length === 0 && availableCategories.length > 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No available categories found</p>
            <p className="text-sm text-gray-400">
              {searchTerm ? "Try adjusting your search term" : "All categories have been added"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add New Category Section */}
      {!loadingCategories && filteredAvailableCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Category</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search care categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(addCategory)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="categoryName">Category</Label>
                  <Select
                    onValueChange={(value) => setValue("categoryName", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAvailableCategories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          <div className="flex flex-col">
                            <span>{category.name}</span>
                            {category.description && (
                              <span className="text-xs text-gray-500 truncate max-w-xs">
                                {category.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.categoryName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="25.00"
                    {...register("hourlyRate", { valueAsNumber: true })}
                  />
                  {errors.hourlyRate && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.hourlyRate.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="experienceLevel">
                    Experience Level ({watch("experienceLevel") || 5}/10)
                  </Label>
                  <div className="mt-2">
                    <Slider
                      value={[watch("experienceLevel") || 5]}
                      onValueChange={(value) => setValue("experienceLevel", value[0])}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  {errors.experienceLevel && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.experienceLevel.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  {...register("description")}
                  placeholder="Describe your experience and approach for this category..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2CB]/20 focus:border-[#00C2CB] transition-colors resize-none"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="bg-[#00C2CB] hover:bg-[#00A5AD]"
                disabled={addingCategory}
              >
                {addingCategory ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Attaching...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Current Categories */}
      <div className="space-y-4">
        <h4 className="font-medium">Current Categories ({localCategories.length})</h4>

        {localCategories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No categories added yet</p>
              <p className="text-sm text-gray-400">
                Add your first service category to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {localCategories.map((category) => (
              <Card key={category.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h5 className="font-medium">{category.name}</h5>
                        <Badge variant="outline">
                          {getExperienceLabel(category.experienceLevel)}
                        </Badge>
                      </div>

                      {editingCategory === category.id ? (
                        <>
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Hourly Rate ($)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={category.hourlyRate}
                                onChange={(e) =>
                                  updateCategory(
                                    category.id,
                                    "hourlyRate",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </div>

                            <div>
                              <Label>
                                Experience Level ({category.experienceLevel}/10)
                              </Label>
                              <div className="mt-2">
                                <Slider
                                  value={[category.experienceLevel]}
                                  onValueChange={(value) =>
                                    updateCategory(category.id, "experienceLevel", value[0])
                                  }
                                  max={10}
                                  min={1}
                                  step={1}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex space-x-2">
                            <Button
                              onClick={() => {
                                const categoryToSave = localCategories.find(c => c.id === category.id);
                                if (categoryToSave) saveCategoryChanges(categoryToSave);
                              }}
                              className="bg-[#00C2CB] hover:bg-[#00A5AD] text-white"
                              size="sm"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditingCategory(null)}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="mt-2 text-sm text-gray-600">
                          {category.description && (
                            <p className="mb-2 text-gray-700">{category.description}</p>
                          )}
                          <p>Rate: ${category.hourlyRate}/hour</p>
                          <p>Experience: {category.experienceLevel}/10</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {editingCategory !== category.id && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCategory(category.id)}
                          >
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeCategory(category.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {hasChanges && (
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={resetChanges}
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Changes
          </Button>

          <Button
            onClick={saveChanges}
            disabled={isLoading}
            className="bg-[#00C2CB] hover:bg-[#00A5AD]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}