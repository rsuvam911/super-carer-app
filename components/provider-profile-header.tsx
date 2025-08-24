"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import {
    ProviderProfileDetails,
    Qualifications,
} from "@/types/api"; // Adjust path

interface ProviderProfileHeaderProps {
    profile: ProviderProfileDetails;
}

const ProviderProfileHeader: React.FC<ProviderProfileHeaderProps> = ({
    profile,
}) => {
    // Parse qualifications if it's a JSON string
    let qualifications: Qualifications = { education: "N/A", certifications: [] };
    try {
        if (profile.qualifications) {
            qualifications = JSON.parse(profile.qualifications) as Qualifications;
        }
    } catch (e) {
        console.warn("Failed to parse qualifications:", e);
    }

    return (
        <Card className="bg-background rounded-xl shadow-md p-6 mb-8 border">
            {/* Header: Avatar + Name + Rating */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-28 w-28 border-4 border-primary shadow-lg">
                    <AvatarImage
                        src={profile.profilePictureUrl}
                        alt={`${profile.firstName} ${profile.lastName}`}
                    />
                    <AvatarFallback className="text-3xl font-semibold">
                        {profile.firstName.charAt(0)}
                        {profile.lastName.charAt(0)}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold">
                        {profile.firstName} {profile.lastName}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {profile.yearsExperience} years of experience
                    </p>

                    {/* Rating */}
                    <div className="flex items-center justify-center md:justify-start mt-3">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 font-medium text-foreground">N/A</span>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                            {profile.ratingCount || 0} reviews
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-sm">
                {/* About */}
                <div className="p-4 border rounded-lg bg-muted/30">
                    <h3 className="font-semibold mb-2 text-foreground">About</h3>
                    <p className="text-muted-foreground">
                        {profile.bio || "No bio available."}
                    </p>
                </div>

                {/* Qualifications */}
                <div className="p-4 border rounded-lg bg-muted/30">
                    <h3 className="font-semibold mb-2 text-foreground">Qualifications</h3>
                    <p className="mb-2">
                        <span className="font-medium">Education:</span>{" "}
                        {qualifications.education || "N/A"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {qualifications.certifications &&
                            qualifications.certifications.length > 0 ? (
                            qualifications.certifications.map((cert, i) => (
                                <Badge
                                    key={i}
                                    className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                                >
                                    {cert}
                                </Badge>
                            ))
                        ) : (
                            <p className="text-muted-foreground">No certifications</p>
                        )}
                    </div>
                </div>

                {/* Travel */}
                <div className="p-4 border rounded-lg bg-muted/30">
                    <h3 className="font-semibold mb-2 text-foreground">Travel</h3>
                    <p>
                        {profile.travelExperience?.willingToTravel
                            ? "✅ Willing to travel"
                            : "❌ Not willing to travel"}
                    </p>
                    {profile.travelExperience?.maxTravelDistance && (
                        <p className="text-muted-foreground">
                            Max Distance: {profile.travelExperience.maxTravelDistance} km
                        </p>
                    )}
                </div>

                {/* Availability */}
                <div className="p-4 border rounded-lg bg-muted/30">
                    <h3 className="font-semibold mb-2 text-foreground">Availability</h3>
                    <p>Overnight: {profile.providesOvernight ? "✅ Yes" : "❌ No"}</p>
                    <p>Live-in: {profile.providesLiveIn ? "✅ Yes" : "❌ No"}</p>
                </div>
            </div>
        </Card>
    );
};

export default ProviderProfileHeader;
