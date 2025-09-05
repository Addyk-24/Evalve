import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';

interface StartupChatbotProps {
  startup: {
    id?: string;
    name: string;
    description: string;
    founderName: string;
    domain: string;
    stage: string;
    revenueRaised: string;
    location: string;
    employees: string;
  };
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const StartupChatbot: React.FC<StartupChatbotProps> = ({ startup }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show "still confused" prompt every 10 seconds
  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        setShowPrompt(true);
        setTimeout(() => setShowPrompt(false), 3000);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Initial greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        id: '1',
        text: `Hello! I'm here to help you learn more about ${startup.name}. You can ask me about their business model, team, funding, market opportunity, or any other questions you have about this investment opportunity.`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  }, [isOpen, startup.name, messages.length]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('founder') || message.includes('team')) {
      return `${startup.name} was founded by ${startup.founderName}. The company currently has ${startup.employees} employees working together to build their vision in the ${startup.domain} space.`;
    }
    
    if (message.includes('revenue') || message.includes('funding') || message.includes('money')) {
      return `${startup.name} has raised ${startup.revenueRaised} to date. They are currently in the ${startup.stage} stage, which typically indicates strong early traction and proven product-market fit.`;
    }
    
    if (message.includes('business') || message.includes('product') || message.includes('what do')) {
      return `${startup.name} operates in the ${startup.domain} sector. ${startup.description} They are based in ${startup.location} and focus on delivering innovative solutions in their market.`;
    }
    
    if (message.includes('risk') || message.includes('concern')) {
      return `Like any early-stage investment, ${startup.name} carries inherent risks. However, their ${startup.stage} status and ${startup.revenueRaised} in funding suggest they've achieved key milestones. I recommend reviewing their financials, market size, and competitive positioning for a complete risk assessment.`;
    }
    
    if (message.includes('market') || message.includes('competition')) {
      return `${startup.name} operates in the ${startup.domain} market. The ${startup.domain} sector has shown significant growth potential. Their location in ${startup.location} provides access to talent and market opportunities. Consider researching market size and competitive landscape for this sector.`;
    }
    
    if (message.includes('invest') || message.includes('should i')) {
      return `Investment decisions should be based on your personal investment criteria, risk tolerance, and portfolio strategy. ${startup.name} has shown promise with ${startup.revenueRaised} raised and ${startup.employees} team members. I recommend conducting thorough due diligence before making any investment decisions.`;
    }
    
    if (message.includes('contact') || message.includes('meeting')) {
      return `You can reach out to ${startup.founderName} and the team by clicking the "Contact Founder" button on this page. Many founders are open to investor calls to discuss their vision, metrics, and growth plans in more detail.`;
    }
    
    return `That's a great question about ${startup.name}! While I can provide general information about their ${startup.stage} stage status, ${startup.revenueRaised} in funding, and their focus on ${startup.domain}, I recommend reaching out to ${startup.founderName} directly for more specific details. Would you like me to help you formulate questions for the founder?`;
  };

  const handleSendMessage = async () => {
    const baseUrl = 'http://localhost:8000'

    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputMessage;
    setInputMessage('');

    try {
      const res = await fetch(`${baseUrl}/api/startups/${startup.id}/chat`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          {
            query,
            session_id: null
          }),
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      // Now backend here will return response: {response,session_id,startup_id}
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev=> [...prev,botResponse]);

    } catch (err) {
    console.error(err);
    const errorMsg: Message = {
      id: (Date.now() + 2).toString(),
      text: "⚠️ Sorry, I couldn’t connect to the server. Please try again.",
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, errorMsg]);
  }
    // // Simulate bot typing delay
    // setTimeout(() => {
    //   const botResponse: Message = {
    //     id: (Date.now() + 1).toString(),
    //     text: generateBotResponse(inputMessage),
    //     isUser: false,
    //     timestamp: new Date()
    //   };
    //   setMessages(prev => [...prev, botResponse]);
    // }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Icon with Prompt */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && showPrompt && (
          <div className="absolute bottom-16 right-0 bg-background border border-border rounded-lg p-3 shadow-lg mb-2 animate-fade-in">
            <p className="text-sm text-foreground whitespace-nowrap">Still confused?</p>
          </div>
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-primary-foreground" />
          ) : (
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-background border border-border rounded-lg shadow-xl z-50 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{startup.name} Assistant</h3>
                <p className="text-xs text-muted-foreground">Ask me anything about this startup</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${message.isUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isUser ? 'bg-secondary' : 'bg-primary'
                  }`}>
                    {message.isUser ? (
                      <User className="w-3 h-3 text-secondary-foreground" />
                    ) : (
                      <Bot className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${
                    message.isUser 
                      ? 'bg-secondary text-secondary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about this startup..."
                className="flex-1 p-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StartupChatbot;