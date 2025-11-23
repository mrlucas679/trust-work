/**
 * Debug component to check user profile and role
 * Temporary file for troubleshooting - can be deleted after debugging
 */

import { useEffect, useState } from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DebugProfile = () => {
    const { supabase, user } = useSupabase();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState<{ data: unknown; error: unknown } | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            console.log('Profile data:', data);
            console.log('Profile error:', error);
            console.log('LocalStorage selectedUserRole:', localStorage.getItem('selectedUserRole'));
            console.log('LocalStorage pendingUserRole:', localStorage.getItem('pendingUserRole'));

            setProfileData({ data, error });
            setLoading(false);
        };

        loadProfile();
    }, [user, supabase]);

    const updateToJobSeeker = async () => {
        if (!user) return;

        setUpdating(true);
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                role: 'job_seeker',
            });

        if (error) {
            console.error('Update error:', error);
            alert('Error updating profile: ' + error.message);
        } else {
            alert('Profile updated to job_seeker! Redirecting to setup...');
            navigate('/setup');
        }
        setUpdating(false);
    };

    const updateToEmployer = async () => {
        if (!user) return;

        setUpdating(true);
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                role: 'employer',
            });

        if (error) {
            console.error('Update error:', error);
            alert('Error updating profile: ' + error.message);
        } else {
            alert('Profile updated to employer! Redirecting to setup...');
            navigate('/setup');
        }
        setUpdating(false);
    };

    const clearLocalStorage = () => {
        localStorage.removeItem('selectedUserRole');
        localStorage.removeItem('pendingUserRole');
        alert('LocalStorage cleared!');
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Profile Debug Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-bold mb-2">User ID:</h3>
                        <code className="block p-2 bg-gray-100 rounded">{user?.id || 'Not logged in'}</code>
                    </div>

                    <div>
                        <h3 className="font-bold mb-2">User Email:</h3>
                        <code className="block p-2 bg-gray-100 rounded">{user?.email || 'N/A'}</code>
                    </div>

                    <div>
                        <h3 className="font-bold mb-2">Profile Data:</h3>
                        <pre className="p-4 bg-gray-100 rounded overflow-auto">
                            {JSON.stringify(profileData, null, 2)}
                        </pre>
                    </div>

                    <div>
                        <h3 className="font-bold mb-2">LocalStorage:</h3>
                        <pre className="p-4 bg-gray-100 rounded">
                            {JSON.stringify({
                                selectedUserRole: localStorage.getItem('selectedUserRole'),
                                pendingUserRole: localStorage.getItem('pendingUserRole'),
                            }, null, 2)}
                        </pre>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <Button onClick={updateToJobSeeker} disabled={updating}>
                            Force Update to Job Seeker
                        </Button>
                        <Button onClick={updateToEmployer} disabled={updating} variant="outline">
                            Force Update to Employer
                        </Button>
                        <Button onClick={clearLocalStorage} variant="destructive">
                            Clear LocalStorage
                        </Button>
                        <Button onClick={() => navigate('/setup')} variant="secondary">
                            Go to Setup
                        </Button>
                        <Button onClick={() => navigate('/auth')} variant="ghost">
                            Go to Auth
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DebugProfile;
