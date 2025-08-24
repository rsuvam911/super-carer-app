"use client";
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { ProviderListItem } from "@/types/api";

interface ProviderCardProps {
    provider: ProviderListItem;
    onViewProfile: (userId: string) => void;
    onBookNow: (providerId: string) => void;
}

const categoryColors = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-purple-100 text-purple-800",
    "bg-red-100 text-red-800",
    "bg-orange-100 text-orange-800",
];

const ProviderCard: React.FC<ProviderCardProps> = ({
    provider,
    onViewProfile,
    onBookNow,
}) => {
    const maxRate = provider.categories.reduce(
        (max, cat) => (cat.hourlyRate > max ? cat.hourlyRate : max),
        0
    );

    return (
        <Card className="w-full max-w-sm rounded-xl overflow-hidden shadow-md border border-border bg-background">
            {/* Header bar */}
            <CardHeader className="h-12 bg-primary relative" />

            {/* Avatar overlapping header */}
            <div className="flex justify-center -mt-10">
                <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                    <AvatarImage
                        src={provider.profilePictureUrl}
                        alt={`${provider.firstName} ${provider.lastName}`}
                    />
                    <AvatarFallback className="text-lg font-semibold">
                        {provider.firstName.charAt(0)}
                        {provider.lastName.charAt(0)}
                    </AvatarFallback>
                </Avatar>
            </div>

            {/* Content */}
            <CardContent className="px-6 py-4 text-center">
                <h3 className="text-lg font-semibold text-foreground">
                    {provider.firstName} {provider.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {provider.yearsExperience} years experience
                </p>

                {/* Rating */}
                <div className="flex items-center justify-center mt-2 text-yellow-500">
                    <Star className="h-4 w-4 fill-yellow-400 mr-1" />
                    <span className="text-sm font-medium">N/A</span>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {provider.categories.slice(0, 3).map((category, index) => (
                        <Badge
                            key={category.id}
                            className={`px-3 py-1 text-xs rounded-full font-medium ${categoryColors[index % categoryColors.length]
                                }`}
                        >
                            {category.name}
                        </Badge>
                    ))}
                    {provider.categories.length > 3 && (
                        <Badge className="px-3 py-1 text-xs rounded-full font-medium bg-gray-200 text-gray-800">
                            +{provider.categories.length - 3}
                        </Badge>
                    )}
                </div>

                {/* Pricing */}
                <p className="mt-4 text-base font-semibold text-foreground">
                    From <span className="text-primary">${maxRate}</span>/hr
                </p>
            </CardContent>

            {/* Footer actions */}
            <CardFooter className="px-6 py-4 flex flex-col sm:flex-row gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-md"
                    onClick={() => onViewProfile(provider.userId)}
                >
                    View Profile
                </Button>
                <Button
                    size="sm"
                    className="flex-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => onBookNow(provider.userId)}
                >
                    Book Now
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ProviderCard;
