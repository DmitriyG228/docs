"use client";

import React, { useState, useEffect } from 'react';
import { getVerifyEmailConfig } from '@/emails/templates/verification/verify';
import { getWelcomeEmailConfig } from '@/emails/templates/welcome';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Copy, ExternalLink } from 'lucide-react';

export default function EmailPreviewPage() {
  const [company, setCompany] = useState("Demo Company");
  const [email, setEmail] = useState("user@example.com");
  const [showingHTML, setShowingHTML] = useState(true);
  const [showingText, setShowingText] = useState(false);
  const [verifyLink, setVerifyLink] = useState(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/email-verification/demo-token-placeholder`);
  const [emailConfigs, setEmailConfigs] = useState<{
    verifyEmailConfig: any;
    welcomeEmailConfig: any;
  }>({
    verifyEmailConfig: null,
    welcomeEmailConfig: null
  });
  
  // Generate random token only on the client side after component mounts
  useEffect(() => {
    const randomToken = Math.floor(Math.random() * 1000000);
    const newVerifyLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/email-verification/demo-token-${randomToken}`;
    setVerifyLink(newVerifyLink);
    
    // Get host to properly display images in the preview
    const host = window.location.origin;
    
    // Update email configs - replace relative image URLs with absolute for preview
    const verifyConfigRaw = getVerifyEmailConfig({
      companyName: company,
      recipientEmail: email,
      verificationLink: newVerifyLink
    });
    
    // Fix image URLs in HTML content for preview
    const verifyConfig = {
      ...verifyConfigRaw,
      email: {
        ...verifyConfigRaw.email,
        html: verifyConfigRaw.email.html.replace(/src="\/([^"]+)"/g, `src="${host}/$1"`)
      }
    };
    
    const welcomeConfigRaw = getWelcomeEmailConfig({
      companyName: company,
      recipientEmail: email
    });
    
    // Fix image URLs in HTML content for preview
    const welcomeConfig = {
      ...welcomeConfigRaw,
      email: {
        ...welcomeConfigRaw.email,
        html: welcomeConfigRaw.email.html.replace(/src="\/([^"]+)"/g, `src="${host}/$1"`)
      }
    };
    
    setEmailConfigs({
      verifyEmailConfig: verifyConfig,
      welcomeEmailConfig: welcomeConfig
    });
  }, []);
  
  // Update configs when company or email changes
  useEffect(() => {
    if (verifyLink !== `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/email-verification/demo-token-placeholder`) {
      // Get host to properly display images in the preview
      const host = window.location.origin;
      
      const verifyConfigRaw = getVerifyEmailConfig({
        companyName: company,
        recipientEmail: email,
        verificationLink: verifyLink
      });
      
      // Fix image URLs in HTML content for preview
      const verifyConfig = {
        ...verifyConfigRaw,
        email: {
          ...verifyConfigRaw.email,
          html: verifyConfigRaw.email.html.replace(/src="\/([^"]+)"/g, `src="${host}/$1"`)
        }
      };
      
      const welcomeConfigRaw = getWelcomeEmailConfig({
        companyName: company,
        recipientEmail: email
      });
      
      // Fix image URLs in HTML content for preview
      const welcomeConfig = {
        ...welcomeConfigRaw,
        email: {
          ...welcomeConfigRaw.email,
          html: welcomeConfigRaw.email.html.replace(/src="\/([^"]+)"/g, `src="${host}/$1"`)
        }
      };
      
      setEmailConfigs({
        verifyEmailConfig: verifyConfig,
        welcomeEmailConfig: welcomeConfig
      });
    }
  }, [company, email, verifyLink]);
  
  // Helper function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };
  
  // If email configs are not yet loaded, show loading state
  if (!emailConfigs.verifyEmailConfig || !emailConfigs.welcomeEmailConfig) {
    return (
      <div className="container max-w-4xl py-8 flex items-center justify-center min-h-[400px]">
        <p>Loading preview...</p>
      </div>
    );
  }
  
  const { verifyEmailConfig, welcomeEmailConfig } = emailConfigs;
  
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Email Template Preview</h1>
      <p className="text-muted-foreground mb-6">
        This page allows you to preview the email templates sent to users during the beta signup process.
        You can customize the recipient details and view both HTML and plain text versions.
      </p>
      
      <div className="bg-muted p-4 rounded-lg mb-6">
        <h2 className="text-lg font-medium mb-3">Customize Preview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Company Name</label>
            <Input 
              value={company} 
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Enter company name"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email Address</label>
            <Input 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="verify">
        <TabsList className="mb-4">
          <TabsTrigger value="verify">Verification Email</TabsTrigger>
          <TabsTrigger value="welcome">Welcome Email</TabsTrigger>
        </TabsList>
        
        <TabsContent value="verify">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-3 flex justify-between items-center">
              <h3 className="font-medium">Verification Email</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowingHTML(!showingHTML)}>
                  {showingHTML ? <ChevronUp size={16} /> : <ChevronDown size={16} />} HTML
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowingText(!showingText)}>
                  {showingText ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Plain Text
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(verifyEmailConfig.email.html)}>
                  <Copy size={16} className="mr-1" /> Copy HTML
                </Button>
              </div>
            </div>
            
            {/* Email details */}
            <div className="p-4 border-b bg-card">
              <p><strong>Subject:</strong> {verifyEmailConfig.email.subject}</p>
              <p><strong>From:</strong> {verifyEmailConfig.email.from.name} &lt;{verifyEmailConfig.email.from.email}&gt;</p>
              <p><strong>To:</strong> {verifyEmailConfig.email.to[0].name} &lt;{verifyEmailConfig.email.to[0].email}&gt;</p>
              <p><strong>Verification Link:</strong> <code className="bg-muted px-1 py-0.5 rounded text-sm">{verifyLink}</code></p>
            </div>
            
            {/* HTML Preview */}
            {showingHTML && (
              <div className="border-t">
                <div className="bg-muted px-3 py-2 flex justify-between items-center">
                  <h4 className="text-sm font-medium">HTML Preview</h4>
                  <a 
                    href={`data:text/html;charset=utf-8,${encodeURIComponent(verifyEmailConfig.email.html)}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm flex items-center"
                  >
                    Open in new tab <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
                <div className="h-[500px] overflow-auto">
                  <iframe 
                    srcDoc={verifyEmailConfig.email.html}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Email HTML Preview"
                  />
                </div>
              </div>
            )}
            
            {/* Plain Text Preview */}
            {showingText && (
              <div className="border-t">
                <div className="bg-muted px-3 py-2">
                  <h4 className="text-sm font-medium">Plain Text Preview</h4>
                </div>
                <div className="p-4 max-h-[300px] overflow-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded">{verifyEmailConfig.email.text}</pre>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="welcome">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-3 flex justify-between items-center">
              <h3 className="font-medium">Welcome Email</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowingHTML(!showingHTML)}>
                  {showingHTML ? <ChevronUp size={16} /> : <ChevronDown size={16} />} HTML
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowingText(!showingText)}>
                  {showingText ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Plain Text
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(welcomeEmailConfig.email.html)}>
                  <Copy size={16} className="mr-1" /> Copy HTML
                </Button>
              </div>
            </div>
            
            {/* Email details */}
            <div className="p-4 border-b bg-card">
              <p><strong>Subject:</strong> {welcomeEmailConfig.email.subject}</p>
              <p><strong>From:</strong> {welcomeEmailConfig.email.from.name} &lt;{welcomeEmailConfig.email.from.email}&gt;</p>
              <p><strong>To:</strong> {welcomeEmailConfig.email.to[0].name} &lt;{welcomeEmailConfig.email.to[0].email}&gt;</p>
            </div>
            
            {/* HTML Preview */}
            {showingHTML && (
              <div className="border-t">
                <div className="bg-muted px-3 py-2 flex justify-between items-center">
                  <h4 className="text-sm font-medium">HTML Preview</h4>
                  <a 
                    href={`data:text/html;charset=utf-8,${encodeURIComponent(welcomeEmailConfig.email.html)}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm flex items-center"
                  >
                    Open in new tab <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
                <div className="h-[500px] overflow-auto">
                  <iframe 
                    srcDoc={welcomeEmailConfig.email.html}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Email HTML Preview"
                  />
                </div>
              </div>
            )}
            
            {/* Plain Text Preview */}
            {showingText && (
              <div className="border-t">
                <div className="bg-muted px-3 py-2">
                  <h4 className="text-sm font-medium">Plain Text Preview</h4>
                </div>
                <div className="p-4 max-h-[300px] overflow-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded">{welcomeEmailConfig.email.text}</pre>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Note: This is a debug tool for developers to preview email templates. Your email provider may render emails slightly differently.</p>
      </div>
    </div>
  );
} 