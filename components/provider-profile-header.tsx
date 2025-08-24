"use client"
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star } from 'lucide-react';
import { ProviderProfileDetails, Qualifications } from '@/types/api'; // Adjust path

interface ProviderProfileHeaderProps {
    profile: ProviderProfileDetails;
}

const ProviderProfileHeader: React.FC<ProviderProfileHeaderProps> = ({ profile }) => {
    // Parse qualifications if it's a JSON string
    let qualifications: Qualifications = { education: 'N/A', certifications: [] };
    try {
        if (profile.qualifications) {
            qualifications = JSON.parse(profile.qualifications) as Qualifications;
        }
    } catch (e) {
        console.warn('Failed to parse qualifications:', e);
    }

    return (
        <div className="bg-background rounded-lg shadow-sm p-6 mb-6 border">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-24 w-24 border-2 border-accent">
                    <AvatarImage src={profile.profilePictureUrl} alt={`${profile.firstName} ${profile.lastName}`} />
                    <AvatarFallback className="text-2xl">{profile.firstName.charAt(0)}{profile.lastName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h1>
                            <p className="text-muted-foreground">{profile.yearsExperience} years of experience</p>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1 font-medium">N/A</span> {/* Display rating if available */}
                            <span className="mx-2 text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{profile.ratingCount || 0} reviews</span>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h3 className="font-semibold mb-1">About</h3>
                            <p>{profile.bio || 'No bio available.'}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Qualifications</h3>
                            <p className="mb-1"><span className="font-medium">Education:</span> {qualifications.education || 'N/A'}</p>
                            <p>
                                <span className="font-medium">Certifications:</span> {
                                    qualifications.certifications && qualifications.certifications.length > 0 ?
                                        qualifications.certifications.join(', ') : 'N/A'
                                }
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Travel</h3>
                            <p>{profile.travelExperience?.willingToTravel ? 'Willing to travel' : 'Not willing to travel'}</p>
                            {profile.travelExperience?.maxTravelDistance && (
                                <p>Max Distance: {profile.travelExperience.maxTravelDistance} km</p>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Availability</h3>
                            <p>Overnight: {profile.providesOvernight ? 'Yes' : 'No'}</p>
                            <p>Live-in: {profile.providesLiveIn ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderProfileHeader;