import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const BackNavigationButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Define restricted paths where back button should be hidden (during active quizzes/assignments)
    const restrictedPaths = [
        '/assignments/:skill/:level/warning',
        '/assignments/:skill/:level/take',
        '/assignment/quiz'
    ];

    // Check if current path matches restricted patterns - more flexible matching
    const isRestricted = restrictedPaths.some(path => {
        // Convert path pattern to regex for matching
        if (path.includes('/warning')) {
            return location.pathname.includes('/warning');
        }
        if (path.includes('/take')) {
            return location.pathname.includes('/take');
        }
        if (path.includes('/quiz')) {
            return location.pathname.includes('/quiz');
        }
        return location.pathname === path;
    });

    // Hide button on restricted pages
    if (isRestricted) {
        return null;
    }

    const handleBack = () => {
        navigate(-1); // Go back in browser history
    };

    return (
        <Button
            variant="ghost"
            onClick={handleBack}
            size="icon"
            className="h-9 w-9"
            aria-label="Go back"
        >
            <ArrowLeft className="h-4 w-4" />
        </Button>
    );
};
