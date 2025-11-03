import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Messages = () => {
  const navigate = useNavigate();

  const conversations = [
    {
      id: "1",
      employer: "TechCorp Solutions",
      jobTitle: "Frontend Developer",
      lastMessage: "Thanks for your application! We'd like to schedule an interview.",
      timestamp: "2 hours ago",
      unread: true,
      avatar: "/placeholder.svg"
    },
    {
      id: "2",
      employer: "StartupXYZ",
      jobTitle: "UI/UX Designer",
      lastMessage: "Could you provide more details about your design process?",
      timestamp: "1 day ago",
      unread: false,
      avatar: "/placeholder.svg"
    },
    {
      id: "3",
      employer: "Global Industries",
      jobTitle: "Project Manager",
      lastMessage: "We've reviewed your portfolio and are impressed!",
      timestamp: "3 days ago",
      unread: true,
      avatar: "/placeholder.svg"
    }
  ];

  return (
    <div className="bg-muted/20 p-6">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground">Communicate safely with verified employers</p>
          </div>

        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="flex-1" />
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          {conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${conversation.unread ? 'border-primary/20 bg-primary/5' : ''
                }`}
              onClick={() => navigate(`/chat/${conversation.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback>{conversation.employer[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {conversation.employer}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {conversation.unread && (
                          <Badge variant="default" className="text-xs">New</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                      </div>
                    </div>

                    <p className="text-sm text-primary font-medium mb-2">
                      {conversation.jobTitle}
                    </p>

                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>

                  <div className="flex flex-col items-center space-y-2">
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    {conversation.unread && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {conversations.length === 0 && (
          <Card className="text-center p-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
            <p className="text-muted-foreground mb-4">
              When you apply for jobs, you'll be able to communicate with employers here.
            </p>
            <Button onClick={() => navigate('/jobs')}>
              Browse Jobs
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Messages;