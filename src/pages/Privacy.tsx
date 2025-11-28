import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Shield, Download, Calendar, Lock, Eye, Database } from "lucide-react";

const Privacy = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-verified" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Last updated: January 15, 2024
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-verified text-verified">
              <Shield className="h-3 w-3 mr-1" />
              POPIA Compliant
            </Badge>
            <Badge variant="outline">
              GDPR Ready
            </Badge>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Eye className="h-6 w-6 text-primary" />
                    1. Information We Collect
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    TrustWork collects information to provide safe, reliable job platform services. We collect information in the following ways:
                  </p>

                  <h3 className="text-xl font-semibold mb-3">Personal Information You Provide</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
                    <li><strong>Profile Information:</strong> Professional experience, skills, education, portfolio items</li>
                    <li><strong>Identity Verification:</strong> ID number, proof of address (for enhanced verification)</li>
                    <li><strong>Employment Information:</strong> CV/resume, work history, references</li>
                    <li><strong>Communication Data:</strong> Messages sent through our platform, support tickets</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3">Information We Collect Automatically</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
                    <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
                    <li><strong>Location Data:</strong> General geographic location (for job matching purposes)</li>
                    <li><strong>Security Logs:</strong> Login attempts, security events for fraud prevention</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Database className="h-6 w-6 text-primary" />
                    2. How We Use Your Information
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    We use the collected information for the following purposes:
                  </p>

                  <h3 className="text-xl font-semibold mb-3">Service Provision</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>Creating and maintaining your account</li>
                    <li>Matching you with relevant job opportunities</li>
                    <li>Facilitating communication between job seekers and employers</li>
                    <li>Processing payments for gig work</li>
                    <li>Providing customer support</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3">Safety and Security</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>Verifying employer legitimacy and conducting background checks</li>
                    <li>Detecting and preventing fraudulent activities</li>
                    <li>Monitoring for suspicious job postings or user behavior</li>
                    <li>Maintaining platform security and user safety</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3">Communication and Marketing</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>Sending job alerts and platform notifications (with your consent)</li>
                    <li>Providing important safety and security updates</li>
                    <li>Sharing platform improvements and new features</li>
                    <li>Conducting user research to improve our services</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
                  <p className="text-muted-foreground mb-4">
                    We do not sell, trade, or rent your personal information. We may share your information in the following circumstances:
                  </p>

                  <h3 className="text-xl font-semibold mb-3">With Employers (Controlled Sharing)</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>Profile information when you apply for jobs (with your explicit consent)</li>
                    <li>Contact information only after mutual interest is established</li>
                    <li>Professional qualifications and work history for job applications</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3">For Legal and Safety Reasons</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>When required by South African law or legal process</li>
                    <li>To protect our users from fraud or safety threats</li>
                    <li>In cooperation with law enforcement investigations</li>
                    <li>To enforce our Terms of Service or investigate violations</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3">With Service Providers</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>Payment processors for secure transactions</li>
                    <li>Identity verification services for employer checks</li>
                    <li>Cloud hosting providers for data storage</li>
                    <li>Email and communication service providers</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Lock className="h-6 w-6 text-verified" />
                    4. Data Security and Protection
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    We implement comprehensive security measures to protect your personal information:
                  </p>

                  <h3 className="text-xl font-semibold mb-3">Technical Security</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>End-to-end encryption for sensitive data transmission</li>
                    <li>Secure SSL certificates for all platform communications</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Multi-factor authentication options for user accounts</li>
                    <li>Automated monitoring for suspicious activities</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3">Administrative Security</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>Limited employee access to personal information on need-to-know basis</li>
                    <li>Regular security training for all staff members</li>
                    <li>Incident response procedures for data breaches</li>
                    <li>Regular backup and disaster recovery protocols</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Your Rights and Choices</h2>
                  <p className="text-muted-foreground mb-4">
                    Under South Africa's POPIA and international standards, you have the following rights:
                  </p>

                  <div className="bg-muted/20 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold mb-2">Data Subject Rights</h3>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li><strong>Access:</strong> Request copies of your personal information</li>
                      <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                      <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                      <li><strong>Portability:</strong> Receive your data in a portable format</li>
                      <li><strong>Objection:</strong> Object to certain processing of your data</li>
                      <li><strong>Restriction:</strong> Request limitation of data processing</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold mb-3">Communication Preferences</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li>Unsubscribe from marketing emails at any time</li>
                    <li>Adjust notification settings in your account preferences</li>
                    <li>Control how your profile information is shared with employers</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
                  <p className="text-muted-foreground mb-4">
                    We retain your personal information for as long as necessary to provide our services:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                    <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
                    <li><strong>Closed Accounts:</strong> Most data deleted within 30 days of account closure</li>
                    <li><strong>Legal Requirements:</strong> Some data retained longer for legal compliance</li>
                    <li><strong>Safety Records:</strong> Fraud prevention data retained for security purposes</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. International Data Transfers</h2>
                  <p className="text-muted-foreground mb-4">
                    While we primarily process data within South Africa, some data may be transferred internationally for cloud hosting and service provision. We ensure appropriate safeguards are in place for any international transfers.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Changes to This Privacy Policy</h2>
                  <p className="text-muted-foreground mb-4">
                    We may update this Privacy Policy from time to time. We will notify users of material changes through email or platform notifications. Continued use of TrustWork after changes constitutes acceptance of the updated policy.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibond mb-4">9. Contact Us</h2>
                  <p className="text-muted-foreground mb-4">
                    For questions about this Privacy Policy or to exercise your rights, contact our Data Protection Officer:
                  </p>
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <ul className="list-none space-y-2 text-muted-foreground">
                      <li><strong>Email:</strong> privacy@trustwork.co.za</li>
                      <li><strong>Phone:</strong> 0800 TRUST (878787)</li>
                      <li><strong>Post:</strong> Data Protection Officer, TrustWork, 123 Business District, Cape Town, 8000</li>
                    </ul>
                  </div>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Privacy;