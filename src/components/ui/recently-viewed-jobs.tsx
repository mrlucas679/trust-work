import { useState, useEffect } from 'react';
import { Card, CardContent } from './card';
import { ScrollArea } from './scroll-area';
import { Button } from './button';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecentJob {
    id: string;
    title: string;
    company: string;
    viewedAt: Date;
}

export const RecentlyViewedJobs = () => {
    const navigate = useNavigate();
    const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);

    useEffect(() => {
        // Load from localStorage
        const stored = localStorage.getItem('recentlyViewedJobs');
        if (stored) {
            setRecentJobs(JSON.parse(stored));
        }
    }, []);

    if (recentJobs.length === 0) return null;

    return (
        <Card>
            <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4">Recently Viewed</h3>
                <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                        {recentJobs.map((job) => (
                            <Button
                                key={job.id}
                                variant="ghost"
                                className="w-full justify-between"
                                onClick={() => navigate(`/job/${job.id}`)}
                            >
                                <div className="text-left">
                                    <div className="font-medium">{job.title}</div>
                                    <div className="text-sm text-muted-foreground">{job.company}</div>
                                </div>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};
