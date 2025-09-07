"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, Save, RotateCcw, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProviderCategory } from "@/types/api";
import { categorySchema, CategoryFormData } from "@/lib/validation/settings-schemas";

interface CareCategoriesSettingsProps {
  categories: ProviderCategory[];
  onUpdate: (categories: ProviderCategory[]) => Promise<void>;
  isLoading: boolean;
}

// Available care categories that providers can choose from
const AVAILABLE_CATEGORIES = [
  "Child Care",
  "Elderly Care",
  "Disability Care", 
  "Companion Care",
  "Overnight Care",
  "Live-in Care",
  "Respite Care",
  "Dementia Care",
  "Post-Surgery Care",
  "Mental Health Support"
];

export default function CareCategoriesSettings({
  categories,
  onUpdate,
  isLoading,
}: CareCategoriesSettingsProps) {
  const [localCategories, setLocalCategories] = useState<ProviderCategory[]>(categories);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

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
  const addCategory = (data: CategoryFormData) => {
    const newCategory: ProviderCategory = {
      id: `temp-${Date.now()}`, // Temporary ID, will be replaced by server
      name: data.categoryName,
      hourlyRate: data.hourlyRate,
      experienceLevel: data.experienceLevel,
    };

    const updatedCategories = [...localCategories, newCategory];
    setLocalCategories(updatedCategories);
    setHasChanges(true);
    reset();
    toast.success("Category added successfully");
  };

  // Update an existing category
  const updateCategory = (categoryId: string, field: keyof ProviderCategory, value: any) => {
    const updatedCategories = localCategories.map((cat) =>
      cat.id === categoryId ? { ...cat, [field]: value } : cat
    );
    setLocalCategories(updatedCategories);
    setHasChanges(true);
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

  // Get categories that are not yet added
  const availableNewCategories = AVAILABLE_CATEGORIES.filter(
    (cat) => !localCategories.find((localCat) => localCat.name === cat)
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

      {/* Add New Category Section */}
      {availableNewCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(addCategory)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="categoryName">Category</Label>
                  <Select
                    onValueChange={(value) => setValue("categoryName", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableNewCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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

              <Button type="submit" className="bg-[#00C2CB] hover:bg-[#00A5AD]">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
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
                      ) : (
                        <div className="mt-2 text-sm text-gray-600">
                          <p>Rate: ${category.hourlyRate}/hour</p>
                          <p>Experience: {category.experienceLevel}/10</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {editingCategory === category.id ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCategory(null)}
                        >
                          Done
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCategory(category.id)}
                        >
                          Edit
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeCategory(category.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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