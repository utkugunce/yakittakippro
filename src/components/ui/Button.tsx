import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "../../lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'danger' | 'secondary'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    isLoading?: boolean
    leftIcon?: React.ElementType
    rightIcon?: React.ElementType
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "md", isLoading, leftIcon: LeftIcon, rightIcon: RightIcon, children, disabled, ...props }, ref) => {

        const variants = {
            default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm border-transparent",
            secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
            outline: "border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-800",
            ghost: "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100 text-gray-600 dark:text-gray-400",
            danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm border-transparent",
        }

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2 text-sm",
            lg: "h-12 px-8 text-base",
            icon: "h-10 w-10 p-2 items-center justify-center"
        }

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white dark:ring-offset-gray-900 active:scale-95",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && LeftIcon && <LeftIcon className={cn("mr-2 h-4 w-4", size === 'icon' && "mr-0")} />}
                {children}
                {!isLoading && RightIcon && <RightIcon className="ml-2 h-4 w-4" />}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
