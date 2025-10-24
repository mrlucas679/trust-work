import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowLeft, Shield, AlertTriangle } from "lucide-react";

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const chatData = {
    employer: "TechCorp Solutions",
    jobTitle: "Frontend Developer",
    verified: true,
    avatar: "/placeholder.svg"
  };

  const messages = [
    {
      id: 1,
      sender: "employer",
      content: "Hi there! Thanks for applying to our Frontend Developer position.",
      timestamp: "10:30 AM",
      date: "Today"
    },
    {
      id: 2,
      sender: "employer", 
      content: "I've reviewed your portfolio and I'm impressed with your React skills. Would you be available for a quick call this week?",
      timestamp: "10:32 AM",
      date: "Today"
    },
    {
      id: 3,
      sender: "user",
      content: "Thank you for your interest! I'd be happy to discuss the position further. I'm available most days this week.",
      timestamp: "2:15 PM",
      date: "Today"
    },
    {
      id: 4,
      sender: "employer",
      content: "Great! How about Thursday at 3 PM? We can do a video call to discuss the role and your experience.",
      timestamp: "2:45 PM", 
      date: "Today"
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/messages')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={chatData.avatar} />
                  <AvatarFallback>{chatData.employer[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="font-semibold">{chatData.employer}</h2>
                    {chatData.verified && (
                      <Badge variant="outline" className="border-verified text-verified">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{chatData.jobTitle}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message Input */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              Your conversations are encrypted and monitored for safety
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;