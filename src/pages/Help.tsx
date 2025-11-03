import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle, Search, MessageCircle, Shield, AlertTriangle,
  Phone, Mail, Clock, CheckCircle, ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Help = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general"
  });

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Support Request Sent",
      description: "We'll get back to you within 24 hours.",
    });
    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: "",
      category: "general"
    });
  };

  const faqs = [
    {
      id: "verification",
      question: "How does TrustWork verify employers?",
      answer: "We verify employers through multiple methods: company registration checks via CIPC, business license verification, physical address confirmation, and background checks on company directors. All verified employers receive our blue checkmark badge."
    },
    {
      id: "safety-tips",
      question: "What safety tips should I follow when job hunting?",
      answer: "Never pay upfront fees, always verify employer details independently, meet in public places for interviews, don't share personal banking details until you're employed, and report any suspicious job postings. Look for our verification badges and trust your instincts."
    },
    {
      id: "red-flags",
      question: "What are common red flags in job postings?",
      answer: "Watch out for: requests for upfront payments, promises of unrealistic salaries, vague job descriptions, immediate hiring without interviews, requests for personal banking information, and employers who avoid video calls or meetings."
    },
    {
      id: "payments",
      question: "How do I get paid for gigs?",
      answer: "Payments are processed securely through our platform. Clients deposit funds in escrow before work begins. Once you complete the work and it's approved, funds are released to your TrustWork wallet and can be withdrawn to your bank account."
    },
    {
      id: "disputes",
      question: "What if I have a dispute with a client or employer?",
      answer: "Use our built-in dispute resolution system. Document all communications and work completed. Our mediation team will review the case and make a fair decision based on the evidence provided by both parties."
    },
    {
      id: "profile-tips",
      question: "How can I improve my profile to get more opportunities?",
      answer: "Complete all profile sections, add a professional photo, showcase your best work in your portfolio, get verified skills through our assessments, maintain a high rating by delivering quality work, and keep your profile updated with recent experience."
    }
  ];

  const scamAwareness = [
    {
      title: "Advance Fee Scams",
      description: "Legitimate employers never ask for upfront payments for jobs, training, or equipment.",
      warning: "high"
    },
    {
      title: "Fake Check Scams",
      description: "Scammers send fake checks and ask you to deposit them and send money back.",
      warning: "high"
    },
    {
      title: "Identity Theft",
      description: "Be cautious about sharing personal documents before confirming legitimate employment.",
      warning: "medium"
    },
    {
      title: "Pyramid Schemes",
      description: "Avoid opportunities that focus mainly on recruiting others rather than selling products or services.",
      warning: "medium"
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
        <p className="text-muted-foreground">Get help, stay safe, and learn how to make the most of TrustWork</p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="p-6">
            <Shield className="h-8 w-8 text-verified mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Safety Center</h3>
            <p className="text-sm text-muted-foreground mb-3">Learn about staying safe while job hunting</p>
            <Button variant="outline" size="sm">Visit Safety Center</Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground mb-3">Chat with our support team</p>
            <Button variant="outline" size="sm">Start Chat</Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Phone className="h-8 w-8 text-accent mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Call Support</h3>
            <p className="text-sm text-muted-foreground mb-3">Speak with us directly</p>
            <Button variant="outline" size="sm">0800 TRUST</Button>
          </CardContent>
        </Card>
      </div>

      {/* Scam Awareness */}
      <Card className="mb-8 border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Scam Awareness
          </CardTitle>
          <CardDescription>
            Stay protected from common job scams and fraudulent postings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {scamAwareness.map((scam, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="mt-1">
                  <Badge variant={scam.warning === 'high' ? 'destructive' : 'secondary'}>
                    {scam.warning === 'high' ? 'High Risk' : 'Medium Risk'}
                  </Badge>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{scam.title}</h4>
                  <p className="text-sm text-muted-foreground">{scam.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-sm">
              <strong>Remember:</strong> If something seems too good to be true, it probably is.
              Always verify employer details and never pay for job opportunities.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No FAQs found matching your search.</p>
              <Button variant="outline" className="mt-2" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            Can't find what you're looking for? Send us a message and we'll help you out.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitContact} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Please provide as much detail as possible about your issue"
                className="min-h-[120px]"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>

          {/* Support Hours */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Support Hours
            </h4>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Monday - Friday</span>
                <span>8:00 AM - 6:00 PM SAST</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span>9:00 AM - 2:00 PM SAST</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-verified" />
              <span>Average response time: 4 hours</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;