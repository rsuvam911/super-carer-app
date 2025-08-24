"use client"

import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SpecialInstructionsInputProps {
    value: string;
    onChange: (value: string) => void;
}

const SpecialInstructionsInput: React.FC<SpecialInstructionsInputProps> = ({ value, onChange }) => {
    return (
        <div className="space-y-2">
            <Label htmlFor="special-instructions" className="text-base">
                Add any notes or special requests for the provider.
            </Label>
            <Textarea
                id="special-instructions"
                placeholder="e.g., 'Please ring the doorbell upon arrival.' or 'My mother prefers to be addressed by her first name, Mary.'"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="min-h-[120px] text-base"
            />
        </div>
    );
};

export default SpecialInstructionsInput;