"use client"
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from 'lucide-react';
import { ProviderListItem } from '@/types/api'; // Adjust path

interface ProviderCardProps {
    provider: ProviderListItem;
    onViewProfile: (userId: string) => void;
    onBookNow: (providerId: string) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onViewProfile, onBookNow }) => {
    // Find the highest hourly rate for display
    const maxRate = provider.categories.reduce((max, cat) => cat.hourlyRate > max ? cat.hourlyRate : max, 0);

    return (
        <Card className="w-full max-w-sm overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="p-4 bg-primary text-primary-foreground"> {/* Using primary theme color */}
                <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 border-2 border-accent"> {/* Using accent theme color */}
                        <AvatarImage src={provider.profilePictureUrl} alt={`${provider.firstName} ${provider.lastName}`} />
                        <AvatarFallback>{provider.firstName.charAt(0)}{provider.lastName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-lg font-bold">{provider.firstName} {provider.lastName}</h3>
                        <p className="text-sm opacity-90">{provider.yearsExperience} years experience</p>
                        <div className="flex items-center mt-1">
                            {/* Rating - Placeholder */}
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1 text-sm">N/A</span> {/* Or display actual rating if available */}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex flex-wrap gap-1 mb-2">
                    {provider.categories.slice(0, 3).map((category) => ( // Show top 3 categories
                        <Badge key={category.id} variant="secondary" className="text-xs">
                            {category.name}
                        </Badge>
                    ))}
                    {provider.categories.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{provider.categories.length - 3}</Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">From ${maxRate}/hr</p>
            </CardContent>
            <CardFooter className="p-4 flex justify-between bg-muted">
                <Button variant="outline" size="sm" onClick={() => onViewProfile(provider.userId)}>
                    View Profile
                </Button>
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => onBookNow(provider.providerId)}> {/* Accent button */}
                    Book Now
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ProviderCard;