import { useEffect, useState } from 'react';
import { useSupabase } from '@/contexts/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DiagnosticResult {
    name: string;
    status: 'success' | 'error' | 'warning';
    message: string;
    details?: string;
}

export default function Diagnostic() {
    const { supabase, user, session } = useSupabase();
    const [results, setResults] = useState<DiagnosticResult[]>([]);
    const [loading, setLoading] = useState(false);

    const runDiagnostics = async () => {
        setLoading(true);
        const diagnostics: DiagnosticResult[] = [];

        // 1. Check authentication
        diagnostics.push({
            name: 'Authentication',
            status: session ? 'success' : 'error',
            message: session ? `Logged in as ${user?.email}` : 'Not logged in',
            details: session ? `User ID: ${user?.id}` : 'Please log in first'
        });

        // 2. Check profile
        if (user) {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            diagnostics.push({
                name: 'Profile',
                status: error ? 'error' : 'success',
                message: error ? 'Profile not found' : `Profile exists (Role: ${profile?.role})`,
                details: error ? error.message : JSON.stringify(profile, null, 2)
            });
        }

        // 3. Test assignments query
        const { data: assignments, error: assignError } = await supabase
            .from('assignments')
            .select('*')
            .eq('status', 'open')
            .limit(1);

        diagnostics.push({
            name: 'Assignments Table',
            status: assignError ? 'error' : 'success',
            message: assignError ? 'Cannot query assignments' : `Can query assignments (${assignments?.length || 0} found)`,
            details: assignError ? `${assignError.message}\nCode: ${assignError.code}` : undefined
        });

        // 4. Test applications query
        const { data: applications, error: appError } = await supabase
            .from('applications')
            .select('*')
            .limit(1);

        diagnostics.push({
            name: 'Applications Table',
            status: appError ? 'error' : 'success',
            message: appError ? 'Cannot query applications' : `Can query applications (${applications?.length || 0} found)`,
            details: appError ? appError.message : undefined
        });

        // 5. Test conversations query
        const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .limit(1);

        diagnostics.push({
            name: 'Conversations Table',
            status: convError ? 'error' : 'success',
            message: convError ? 'Cannot query conversations' : `Can query conversations (${conversations?.length || 0} found)`,
            details: convError ? convError.message : undefined
        });

        setResults(diagnostics);
        setLoading(false);
    };

    useEffect(() => {
        runDiagnostics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'text-green-600';
            case 'error': return 'text-red-600';
            case 'warning': return 'text-yellow-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Database Diagnostics</CardTitle>
                    <CardDescription>
                        Check your Supabase connection, authentication, and table access
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Button onClick={runDiagnostics} disabled={loading}>
                            {loading ? 'Running...' : 'Run Diagnostics Again'}
                        </Button>

                        {results.map((result, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{getStatusIcon(result.status)}</span>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{result.name}</h3>
                                        <p className={getStatusColor(result.status)}>{result.message}</p>
                                        {result.details && (
                                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                                {result.details}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
