import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Download, Calendar } from "lucide-react";

const Terms = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Terms of Service</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Last updated: January 15, 2024
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground mb-4">
                    By accessing and using TrustWork ("we," "our," or "us"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                  <p className="text-muted-foreground">
                    These Terms of Service ("Terms") apply to all users of the TrustWork platform, including job seekers, employers, and any other visitors to our website or mobile application.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                  <p className="text-muted-foreground mb-4">
                    TrustWork is an online platform that connects job seekers with verified employers in South Africa. Our service includes:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>Job listing and application services</li>
                    <li>Employer verification and background checks</li>
                    <li>Gig marketplace for freelance work</li>
                    <li>Portfolio and skill assessment tools</li>
                    <li>Secure messaging and communication features</li>
                    <li>Payment processing for gig work</li>
                    <li>Safety and fraud prevention measures</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Registration</h2>
                  <p className="text-muted-foreground mb-4">
                    To access certain features of TrustWork, you must register for an account. You agree to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>Provide accurate, current, and complete information during registration</li>
                    <li>Maintain and promptly update your account information</li>
                    <li>Maintain the security of your password and identification</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Immediately notify us of any unauthorized use of your account</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Employer Verification</h2>
                  <p className="text-muted-foreground mb-4">
                    TrustWork conducts verification checks on employers, which may include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>Business registration verification through CIPC</li>
                    <li>Physical address and contact information confirmation</li>
                    <li>Background checks on company directors</li>
                    <li>Business license and permit validation</li>
                  </ul>
                  <p className="text-muted-foreground">
                    While we strive for thorough verification, TrustWork cannot guarantee the complete accuracy of all employer information and encourages users to exercise due diligence.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. User Conduct and Prohibited Activities</h2>
                  <p className="text-muted-foreground mb-4">
                    Users agree not to engage in any of the following prohibited activities:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>Posting false, misleading, or fraudulent information</li>
                    <li>Impersonating another person or entity</li>
                    <li>Engaging in harassment, discrimination, or hate speech</li>
                    <li>Attempting to circumvent our verification systems</li>
                    <li>Posting jobs or gigs that violate South African labor laws</li>
                    <li>Requesting upfront payments from job seekers</li>
                    <li>Sharing personal contact information in violation of our policies</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Payment Terms</h2>
                  <p className="text-muted-foreground mb-4">
                    For gig work conducted through our platform:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>Clients must deposit funds in escrow before work begins</li>
                    <li>TrustWork charges a service fee for payment processing</li>
                    <li>Payments are released upon completion and approval of work</li>
                    <li>Disputes may result in withholding of payments pending resolution</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Privacy and Data Protection</h2>
                  <p className="text-muted-foreground mb-4">
                    Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated by reference into these Terms.
                  </p>
                  <p className="text-muted-foreground">
                    We comply with South Africa's Protection of Personal Information Act (POPIA) and international data protection standards.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
                  <p className="text-muted-foreground mb-4">
                    The TrustWork platform, including its design, features, and content, is protected by copyright, trademark, and other intellectual property laws. Users retain ownership of content they create but grant TrustWork a license to use such content for platform operations.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibond mb-4">9. Limitation of Liability</h2>
                  <p className="text-muted-foreground mb-4">
                    TrustWork acts as a platform connecting job seekers and employers. We are not an employment agency and do not guarantee employment outcomes. Our liability is limited to the maximum extent permitted by law.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
                  <p className="text-muted-foreground mb-4">
                    We may suspend or terminate your account for violations of these Terms. You may terminate your account at any time by contacting our support team.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
                  <p className="text-muted-foreground mb-4">
                    These Terms are governed by the laws of South Africa. Any disputes arising from these Terms will be subject to the jurisdiction of South African courts.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
                  <p className="text-muted-foreground mb-4">
                    We reserve the right to modify these Terms at any time. Users will be notified of material changes and continued use constitutes acceptance of modified terms.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
                  <p className="text-muted-foreground mb-2">
                    If you have questions about these Terms, please contact us:
                  </p>
                  <ul className="list-none space-y-2 text-muted-foreground">
                    <li><strong>Email:</strong> legal@trustwork.co.za</li>
                    <li><strong>Phone:</strong> 0800 TRUST (878787)</li>
                    <li><strong>Address:</strong> 123 Business District, Cape Town, 8000</li>
                  </ul>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Terms;