"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme()

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-neutral-900 group-[.toaster]:text-white group-[.toaster]:border-neutral-800 group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-neutral-400",
                    actionButton:
                        "group-[.toast]:bg-neutral-50 group-[.toast]:text-neutral-900",
                    cancelButton:
                        "group-[.toast]:bg-neutral-800 group-[.toast]:text-neutral-400",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
