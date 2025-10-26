import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BadgeCheck, Clock, XCircle, AlertCircle, Building, Shield } from "lucide-react";
import {
    verifyBusiness,
    validateEINFormat,
    formatEIN,
    getVerificationRequirements,
    type BusinessInfo,
    type VerificationResult
} from "@/lib/businessVerification";
import { submitBusinessVerification } from "@/lib/api/businessVerificationApi";
import { useSupabase } from "@/providers/SupabaseProvider";

interface BusinessVerificationProps {
    onVerificationComplete?: (result: VerificationResult) => void;
    initialData?: Partial<BusinessInfo>;
}

export const BusinessVerification = ({
    onVerificationComplete,
    initialData
}: BusinessVerificationProps) => {
    const { user } = useSupabase();

    const [country, setCountry] = useState(initialData?.address?.country || "US");
    const [businessName, setBusinessName] = useState(initialData?.businessName || "");
    const [ein, setEin] = useState(initialData?.ein || "");
    const [street, setStreet] = useState(initialData?.address?.street || "");
    const [city, setCity] = useState(initialData?.address?.city || "");
    const [state, setState] = useState(initialData?.address?.state || "");
    const [zipCode, setZipCode] = useState(initialData?.address?.zipCode || "");
    const [website, setWebsite] = useState(initialData?.website || "");
    const [email, setEmail] = useState(initialData?.email || "");
    const [phone, setPhone] = useState(initialData?.phone || "");

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const requirements = getVerificationRequirements(country);

    const handleEINChange = (value: string) => {
        // Auto-format EIN as user types
        const cleaned = value.replace(/[^\d]/g, '');
        if (cleaned.length <= 9) {
            if (cleaned.length > 2) {
                setEin(`${cleaned.substring(0, 2)}-${cleaned.substring(2)}`);
            } else {
                setEin(cleaned);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setError("You must be logged in to submit a verification request");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Validate EIN format if provided
            if (ein && country === "US" && !validateEINFormat(ein)) {
                setError("Invalid EIN format. Must be 9 digits (XX-XXXXXXX)");
                setLoading(false);
                return;
            }

            const businessInfo: BusinessInfo = {
                businessName,
                ein: country === "US" ? ein : undefined,
                businessNumber: country !== "US" ? ein : undefined,
                address: {
                    street,
                    city,
                    state,
                    zipCode,
                    country,
                },
                website: website || undefined,
                email: email || undefined,
                phone: phone || undefined,
            };

            // Run verification logic
            const verificationResult = await verifyBusiness(businessInfo);

            // Save to Supabase
            const { success, error: apiError } = await submitBusinessVerification(
                user.id,
                businessInfo,
                verificationResult
            );

            if (!success) {
                setError(apiError || "Failed to submit verification request");
                setLoading(false);
                return;
            }

            setResult(verificationResult);

            if (onVerificationComplete) {
                onVerificationComplete(verificationResult);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = () => {
        if (!result) return null;

        if (result.verified) {
            return (
                <Badge variant="default" className="bg-green-600">
                    <BadgeCheck className="mr-1 h-3 w-3" />
                    Verified
                </Badge>
            );
        }

        if (result.requiresManualReview || result.method === 'pending') {
            return (
                <Badge variant="secondary" className="bg-yellow-600 text-white">
                    <Clock className="mr-1 h-3 w-3" />
                    Pending Review
                </Badge>
            );
        }

        return (
            <Badge variant="destructive">
                <XCircle className="mr-1 h-3 w-3" />
                Verification Failed
            </Badge>
        );
    };

    if (result) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Business Verification
                        </CardTitle>
                        {getStatusBadge()}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{result.message}</AlertDescription>
                    </Alert>

                    {result.details && (
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Verification Details:</h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                {result.details.businessNameMatch !== undefined && (
                                    <div className="flex items-center gap-2">
                                        {result.details.businessNameMatch ? (
                                            <BadgeCheck className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-destructive" />
                                        )}
                                        Business Name Match
                                    </div>
                                )}
                                {result.details.einValid !== undefined && (
                                    <div className="flex items-center gap-2">
                                        {result.details.einValid ? (
                                            <BadgeCheck className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-destructive" />
                                        )}
                                        EIN Valid
                                    </div>
                                )}
                                {result.details.addressMatch !== undefined && (
                                    <div className="flex items-center gap-2">
                                        {result.details.addressMatch ? (
                                            <BadgeCheck className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-destructive" />
                                        )}
                                        Address Match
                                    </div>
                                )}
                                {result.details.domainVerified !== undefined && (
                                    <div className="flex items-center gap-2">
                                        {result.details.domainVerified ? (
                                            <BadgeCheck className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-destructive" />
                                        )}
                                        Domain Verified
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {result.requiresManualReview && (
                        <div className="bg-muted/50 border rounded-md p-4">
                            <p className="text-sm text-muted-foreground">
                                Your verification request is under review. Our team typically processes requests within 1-2 business days.
                                You'll receive an email notification once your business is verified.
                            </p>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        onClick={() => {
                            setResult(null);
                            setError(null);
                        }}
                        className="w-full"
                    >
                        Submit Another Verification
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Verify Your Business
                </CardTitle>
                <CardDescription>
                    Verify your business to build trust with job seekers and access premium features.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select value={country} onValueChange={setCountry}>
                            <SelectTrigger id="country">
                                <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="US">United States</SelectItem>
                                <SelectItem value="CA">Canada</SelectItem>
                                <SelectItem value="GB">United Kingdom</SelectItem>
                                <SelectItem value="AU">Australia</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="businessName">
                            Business Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="businessName"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="Enter your registered business name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ein">
                            {requirements.idLabel} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="ein"
                            value={ein}
                            onChange={(e) => country === "US" ? handleEINChange(e.target.value) : setEin(e.target.value)}
                            placeholder={requirements.idFormat}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Format: {requirements.idFormat}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="street">
                            Street Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="street"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="123 Business St"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">
                                City <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="City"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">
                                State/Province <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="state"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                placeholder="State"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="zipCode">
                            ZIP/Postal Code <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="zipCode"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            placeholder="12345"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Business Website</Label>
                        <Input
                            id="website"
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://yourbusiness.com"
                        />
                        <p className="text-xs text-muted-foreground">
                            Optional but increases verification confidence
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Business Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="contact@yourbusiness.com"
                        />
                        <p className="text-xs text-muted-foreground">
                            Must match your business domain for automatic verification
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Business Phone</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="bg-muted/50 border rounded-md p-4">
                        <h4 className="font-medium text-sm mb-2">Required Information:</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {requirements.required.map((req) => (
                                <li key={req}>{req}</li>
                            ))}
                        </ul>
                        {requirements.optional.length > 0 && (
                            <>
                                <h4 className="font-medium text-sm mt-3 mb-2">Optional (Improves Confidence):</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    {requirements.optional.map((opt) => (
                                        <li key={opt}>{opt}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Verifying Business...
                            </>
                        ) : (
                            <>
                                <Shield className="mr-2 h-4 w-4" />
                                Verify Business
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
