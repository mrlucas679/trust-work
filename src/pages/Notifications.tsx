import { AppLayout } from '@/components/layout/AppLayout';

export default function Notifications() {
    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-4">Notifications</h1>
                <p className="text-muted-foreground">Your notifications will appear here.</p>
            </div>
        </AppLayout>
    );
}
