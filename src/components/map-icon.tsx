"use client";

import { memo } from 'react';
import * as icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface MapIconProps extends LucideProps {
    name: string;
}

export const MapIcon = memo(({ name, ...props }: MapIconProps) => {
    // Basic normalization: Capitalize first letter (e.g. "book" -> "Book") if needed, 
    // but usually AI stores "Book". 
    // Also handle kebab-case if necessary? AI creates "Title Case" or "CamelCase" usually.
    // Lucide exports are PascalCase (e.g. "ArrowRight").

    // Attempt multiple casing strategies if direct lookup fails
    const pascalName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-./g, x => x[1].toUpperCase());

    const IconComponent = (icons as any)[name] || (icons as any)[pascalName];

    if (!IconComponent) {
        return <icons.CircleHelp {...props} />; // Fallback
    }

    return <IconComponent {...props} />;
});

MapIcon.displayName = "MapIcon";
