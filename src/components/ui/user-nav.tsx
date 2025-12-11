'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export function UserNav() {
    return (
        <div className="flex items-center gap-2">
            <SignedOut>
                <SignInButton mode="modal">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <User className="h-5 w-5" />
                    </Button>
                </SignInButton>
            </SignedOut>
            <SignedIn>
                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: "h-8 w-8"
                        }
                    }}
                />
            </SignedIn>
        </div>
    );
}
