import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-9 h-9" />; // Prevent layout shift
    }

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={cn(
                "group relative h-9 w-16 rounded-full transition-all duration-300",
                "bg-primary/5 hover:bg-primary/10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "border border-border/5 backdrop-blur supports-[backdrop-filter]:bg-background/40"
            )}
        >
            <div
                className={cn(
                    "absolute top-1 h-7 w-7 rounded-full bg-white/90 shadow-sm transition-all duration-300",
                    "flex items-center justify-center",
                    theme === "light" ? "left-1 rotate-0" : "left-8 rotate-180",
                    "dark:bg-slate-800/90",
                    "group-hover:shadow-md group-active:scale-95"
                )}
            >
                {theme === "light" ? (
                    <Sun className="h-4 w-4 text-yellow-500/90 transition-colors duration-200 group-hover:text-yellow-500" />
                ) : (
                    <Moon className="h-4 w-4 text-slate-300 transition-colors duration-200 group-hover:text-slate-200" />
                )}
            </div>
        </button>
    );
}
