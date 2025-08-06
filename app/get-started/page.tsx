"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CopyIcon, 
  CheckIcon, 
  LockIcon, 
  UnlockIcon, 
  TrophyIcon,
  StarIcon,
  PartyPopperIcon,
  MessageSquareIcon,
  ArrowRightIcon,
  LinkedinIcon,
  CalendarIcon,
  PhoneIcon,
  SendIcon,
  AlertTriangleIcon,
  LaptopIcon
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import confetti from 'canvas-confetti';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GetStartedPage() {
  const [apiKey, setApiKey] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [copied, setCopied] = useState<{[key: string]: boolean}>({});
  const [language, setLanguage] = useState("en");
  const [transcriptSuccess, setTranscriptSuccess] = useState<boolean | null>(null);
  const [showOptionalSteps, setShowOptionalSteps] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Track completion status for each step
  const [completedSteps, setCompletedSteps] = useState<{[key: number]: boolean}>({
    1: false, // API Key
    2: false, // Meeting URL
    3: false, // Start Bot
    3.1: false, // Bot joining process
    4: false, // Get Transcription
    4.1: false, // Check if transcripts working
    5: false, // Change Language (optional)
    6: false, // Stop Bot (always shown)
    7: false,  // List Meetings (optional)
    8: false  // Check Bot Status (optional)
  });
  
  // Track which steps are unlocked
  const [unlockedSteps, setUnlockedSteps] = useState<{[key: number]: boolean}>({
    1: true,  // API Key (initially unlocked)
    2: false, // Meeting URL
    3: false, // Start Bot
    3.1: false, // Bot joining process
    4: false, // Get Transcription
    4.1: false, // Check if transcripts working
    5: false, // Change Language (optional)
    6: false, // Stop Bot (always shown)
    7: false,  // List Meetings (optional)
    8: false  // Check Bot Status (optional)
  });
  
  // Calculate progress for the core flow
  const [progress, setProgress] = useState(0);
  
  // Motivational messages
  const successMessages = [
    "Great job! Keep going!",
    "You're on a roll!",
    "Excellent work!",
    "You're nailing this!",
    "Amazing progress!",
    "You're crushing it!",
    "Skills level up! 🚀",
    "Achievement unlocked!"
  ];
  
  // Current success message
  const [currentMessage, setCurrentMessage] = useState("");
  
  // Load saved progress from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCompletedSteps = localStorage.getItem('completedSteps');
      const savedUnlockedSteps = localStorage.getItem('unlockedSteps');
      const savedApiKey = localStorage.getItem('apiKey');
      const savedMeetingUrl = localStorage.getItem('meetingUrl');
      const savedMeetingId = localStorage.getItem('meetingId');
      const savedOptionalSteps = localStorage.getItem('showOptionalSteps');
      const savedTranscriptSuccess = localStorage.getItem('transcriptSuccess');
      
      if (savedCompletedSteps) {
        setCompletedSteps(JSON.parse(savedCompletedSteps));
      }
      
      if (savedUnlockedSteps) {
        setUnlockedSteps(JSON.parse(savedUnlockedSteps));
      }
      
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
      
      if (savedMeetingUrl) {
        setMeetingUrl(savedMeetingUrl);
      }
      
      if (savedMeetingId) {
        setMeetingId(savedMeetingId);
      }
      
      if (savedOptionalSteps === 'true') {
        setShowOptionalSteps(true);
      }
      
      if (savedTranscriptSuccess) {
        setTranscriptSuccess(savedTranscriptSuccess === 'true');
      }
    }
  }, []);
  
  // Save progress to localStorage when completedSteps changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('completedSteps', JSON.stringify(completedSteps));
      localStorage.setItem('unlockedSteps', JSON.stringify(unlockedSteps));
      localStorage.setItem('apiKey', apiKey);
      localStorage.setItem('meetingUrl', meetingUrl);
      localStorage.setItem('meetingId', meetingId);
      localStorage.setItem('showOptionalSteps', showOptionalSteps.toString());
      if (transcriptSuccess !== null) {
        localStorage.setItem('transcriptSuccess', transcriptSuccess.toString());
      }
    }
  }, [completedSteps, unlockedSteps, apiKey, meetingUrl, meetingId, showOptionalSteps, transcriptSuccess]);
  
  // Update progress when completed steps change
  useEffect(() => {
    // Only count main steps (1, 2, 3, 4) for progress
    const mainSteps = [1, 2, 3, 3.1, 4, 4.1];
    const completedCount = mainSteps.filter(step => completedSteps[step]).length;
    setProgress(Math.round((completedCount / mainSteps.length) * 100));
  }, [completedSteps]);
  
  // Mark a step as completed and unlock the next step
  const completeStep = (step: number) => {
    if (completedSteps[step]) return; // Already completed
    
    // Set random success message
    setCurrentMessage(successMessages[Math.floor(Math.random() * successMessages.length)]);
    
    // Update completed steps
    setCompletedSteps(prev => ({
      ...prev,
      [step]: true
    }));
    
    // Determine next step based on current step
    let nextStep: number | null = null;
    
    if (step === 1) nextStep = 2;
    else if (step === 2) nextStep = 3;
    else if (step === 3) nextStep = 3.1;
    else if (step === 3.1) nextStep = 4;
    else if (step === 4) nextStep = 4.1;
    else if (step === 4.1) {
      // Always unlock the stop bot step
      nextStep = 6;
      
      // If transcripts are working, also unlock optional language step
      if (transcriptSuccess) {
        setShowOptionalSteps(true);
        setUnlockedSteps(prev => ({
          ...prev,
          5: true,
          7: true,
          8: true
        }));
      }
    }
    
    // Unlock next step if there is one
    if (nextStep) {
      setUnlockedSteps(prev => ({
        ...prev,
        [nextStep]: true
      }));
    }
  };

  // Extract Google Meet ID from URL
  const extractMeetingId = (url: string) => {
    try {
      const meetRegex = /meet\.google\.com\/([a-z]+-[a-z]+-[a-z]+)/i;
      const matches = url.match(meetRegex);
      if (matches && matches[1]) {
        return matches[1];
      }
      return "";
    } catch (error) {
      console.error("Error extracting meeting ID:", error);
      return "";
    }
  };

  // Handle meeting URL change
  const handleMeetingUrlChange = (url: string) => {
    setMeetingUrl(url);
    const id = extractMeetingId(url);
    setMeetingId(id);
    
    // If valid meeting ID is extracted, mark step 2 as completed
    if (id) {
      completeStep(2);
    }
  };
  
  // Handle API key input
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    
    // Mark step 1 as completed if API key is valid (basic validation)
    if (key.length > 10) {
      completeStep(1);
    }
  };
  
  // Handle transcript success/failure
  const handleTranscriptResult = (success: boolean) => {
    setTranscriptSuccess(success);
    completeStep(4.1);
    
    // Immediately trigger confetti if successful
    if (success && typeof window !== 'undefined') {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      });
    }
  };

  // Generate the start bot command
  const generateStartBotCommand = () => {
    if (!apiKey || !meetingId) return "";
    
    return `curl -X POST \\
  https://gateway.dev.vexa.ai/bots \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Key: ${apiKey}' \\
  -d '{
    "platform": "google_meet",
    "native_meeting_id": "${meetingId}",
    "bot_name": "MyMeetingBot"
  }'`;
  };

  // Generate the get transcription command
  const generateTranscriptCommand = () => {
    if (!apiKey || !meetingId) return "";
    
    return `curl -X GET \\
  https://gateway.dev.vexa.ai/transcripts/google_meet/${meetingId} \\
  -H 'X-API-Key: ${apiKey}'`;
  };
  
  // Generate the get bot status command
  const generateBotStatusCommand = () => {
    if (!apiKey) return "";
    
    return `curl -X GET \\
  https://gateway.dev.vexa.ai/bots/status \\
  -H 'X-API-Key: ${apiKey}'`;
  };

  // Generate the change language command
  const generateChangeLangCommand = () => {
    if (!apiKey || !meetingId) return "";
    
    return `curl -X PUT \\
  https://gateway.dev.vexa.ai/bots/google_meet/${meetingId}/config \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Key: ${apiKey}' \\
  -d '{
    "language": "${language}"
  }'`;
  };

  // Generate the stop bot command
  const generateStopBotCommand = () => {
    if (!apiKey || !meetingId) return "";
    
    return `curl -X DELETE \\
  https://gateway.dev.vexa.ai/bots/google_meet/${meetingId} \\
  -H 'X-API-Key: ${apiKey}'`;
  };
  
  // Generate the list meetings command
  const generateListMeetingsCommand = () => {
    if (!apiKey) return "";
    
    return `curl -X GET \\
  https://gateway.dev.vexa.ai/meetings \\
  -H 'X-API-Key: ${apiKey}'`;
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string, id: string, stepNumber: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({...copied, [id]: true});
      setTimeout(() => {
        setCopied({...copied, [id]: false});
      }, 2000);
      
      // Mark step as completed when command is copied
      completeStep(stepNumber);
    });
  };
  
  // Render a step card with locked/unlocked state
  const StepCard = ({ 
    stepNumber, 
    title, 
    children, 
    isCompleted = false,
    isSubstep = false
  }: { 
    stepNumber: number; 
    title: string; 
    children: React.ReactNode;
    isCompleted?: boolean;
    isSubstep?: boolean;
  }) => {
    const isUnlocked = unlockedSteps[stepNumber];
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: stepNumber * 0.1 }}
        className={isSubstep ? "ml-8" : ""}
      >
        <Card className={`
          relative 
          ${isUnlocked ? 'opacity-100' : 'opacity-50'} 
          ${isCompleted ? 'border-green-500 shadow-md' : ''}
          ${isSubstep ? 'border-l-4 border-l-blue-500' : ''}
        `}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full 
                ${isCompleted ? 'bg-green-500 text-white' : isSubstep ? 'bg-blue-100' : 'bg-secondary'} 
                font-bold
              `}>
                {isCompleted ? <CheckIcon size={16} /> : stepNumber}
              </div>
              <CardTitle>{title}</CardTitle>
            </div>
            {isCompleted && <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>}
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md z-10">
                <div className="flex flex-col items-center p-4">
                  <LockIcon size={24} className="text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Complete previous steps to unlock</p>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Add a function to reset progress
  const resetProgress = () => {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('completedSteps');
      localStorage.removeItem('unlockedSteps');
      localStorage.removeItem('apiKey');
      localStorage.removeItem('meetingUrl');
      localStorage.removeItem('meetingId');
      localStorage.removeItem('showOptionalSteps');
      localStorage.removeItem('transcriptSuccess');
    }
    
    // Reset state
    setCompletedSteps({
      1: false, // API Key
      2: false, // Meeting URL
      3: false, // Start Bot
      3.1: false, // Bot joining process
      4: false, // Get Transcription
      4.1: false, // Check if transcripts working
      5: false, // Change Language (optional)
      6: false, // Stop Bot (always shown)
      7: false, // List Meetings (optional)
      8: false // Check Bot Status (optional)
    });
    
    setUnlockedSteps({
      1: true,  // API Key (initially unlocked)
      2: false, // Meeting URL
      3: false, // Start Bot
      3.1: false, // Bot joining process
      4: false, // Get Transcription
      4.1: false, // Check if transcripts working
      5: false, // Change Language (optional)
      6: false, // Stop Bot (always shown)
      7: false, // List Meetings (optional)
      8: false // Check Bot Status (optional)
    });
    
    setApiKey("");
    setMeetingUrl("");
    setMeetingId("");
    setShowOptionalSteps(false);
    setTranscriptSuccess(null);
    setProgress(0);
    setCurrentMessage("");
    setCopied({});
  };

  // Detect mobile devices
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    if (typeof window !== 'undefined') {
      checkIsMobile();
      window.addEventListener('resize', checkIsMobile);
      return () => window.removeEventListener('resize', checkIsMobile);
    }
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-2">Starting Guide</h1>
      <div className="flex justify-between items-center mb-6">
        <p className="text-xl">
          Follow these steps to get your first transcription in under 5 minutes.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={resetProgress}
          className="text-sm"
        >
          Reset Progress
        </Button>
      </div>
      
      {/* Mobile warning message */}
      {isMobile && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Desktop Computer Required</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>This guide involves copying and running terminal commands, which requires a desktop computer environment.</p>
            
            <div className="flex flex-col gap-2 bg-background/50 p-3 rounded-md border border-red-200">
              <h4 className="font-medium flex items-center gap-2">
                <LaptopIcon className="h-4 w-4" />
                What you can do:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Bookmark this page and return when you're on a desktop computer</li>
                <li>Join our <Link href="https://discord.gg/Ga9duGkVz9" target="_blank" className="text-blue-600 hover:underline">Discord community</Link> for mobile-friendly help</li>
                {/* <li>Contact our support team at <a href="mailto:support@vexa.ai" className="text-blue-600 hover:underline">support@vexa.ai</a></li> */}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm">Progress</span>
          <span className="text-sm font-bold">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        
        {/* Success message */}
        {currentMessage && progress > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-2 text-green-600"
          >
            <StarIcon size={16} className="text-yellow-500" />
            <span>{currentMessage}</span>
          </motion.div>
        )}
      </div>
      
      <div className="space-y-8 mb-10">
        <StepCard 
          stepNumber={1} 
          title="Get Your API Key" 
          isCompleted={completedSteps[1]}
        >
          <p className="mb-4">
            Get your API key to authenticate your requests to Vexa.ai.
          </p>
          <Link 
            href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard/api-keys`} 
            target="_blank"
            className="block w-full"
            onClick={() => setUnlockedSteps(prev => ({...prev, 1: true}))}
          >
            <Button className="w-full">
              Get API Key
            </Button>
          </Link>
          <div className="mt-6">
            <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
              Paste your API key here:
            </label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Your API Key"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              className="w-full"
            />
          </div>
        </StepCard>

        <StepCard 
          stepNumber={2} 
          title="Start a Google Meet" 
          isCompleted={completedSteps[2]}
        >
          <p className="mb-4">
            Start a new Google Meet session and copy the meeting URL.
          </p>
          <Link 
            href="https://meet.new" 
            target="_blank"
            className="block w-full"
          >
            <Button className="w-full">
              Start New Google Meet
            </Button>
          </Link>
          <div className="mt-6">
            <label htmlFor="meetingUrl" className="block text-sm font-medium mb-2">
              Paste your Google Meet URL here:
            </label>
            <Input
              id="meetingUrl"
              type="text"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              value={meetingUrl}
              onChange={(e) => handleMeetingUrlChange(e.target.value)}
              className="w-full"
            />
            {meetingId && (
              <p className="text-sm text-green-600 mt-2">
                Meeting ID: {meetingId}
              </p>
            )}
          </div>
        </StepCard>

        <StepCard 
          stepNumber={3} 
          title="Start the Bot" 
          isCompleted={completedSteps[3]}
        >
          <p className="mb-4">
            Use the following command to start a bot in your Google Meet:
          </p>
          <div className="relative">
            <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
              <code>{generateStartBotCommand() || "Please enter your API key and Google Meet URL first"}</code>
            </pre>
            {generateStartBotCommand() && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 px-3 py-1 flex items-center gap-1 shadow-sm border"
                onClick={() => copyToClipboard(generateStartBotCommand(), "startBot", 3)}
              >
                {copied["startBot"] ? 
                  <>
                    <CheckIcon size={16} />
                    <span>Copied!</span>
                  </> : 
                  <>
                    <CopyIcon size={16} />
                    <span>Copy</span>
                  </>
                }
              </Button>
            )}
          </div>
          <p className="mt-4">
            Run this command in your terminal. The bot will request to join your meeting.
          </p>
        </StepCard>
        
        <StepCard
          stepNumber={3.1}
          title="Let the Bot Join & Start Speaking"
          isCompleted={completedSteps[3.1]}
          isSubstep={true}
        >
          <ol className="list-decimal list-inside space-y-4 mb-4">
            <li className="py-2 px-3 bg-secondary/30 rounded">
              <span className="font-medium">Wait for the bot:</span> After running the command, wait for about 10 seconds for the bot to request entry to your meeting.
            </li>
            <li className="py-2 px-3 bg-secondary/30 rounded">
              <span className="font-medium">Allow the bot to enter:</span> Look for the "MyMeetingBot" join request in your Google Meet and click "Allow" to let the bot join.
            </li>
            <li className="py-2 px-3 bg-secondary/30 rounded">
              <span className="font-medium">Start speaking:</span> Start speaking in your meeting. The bot will listen and transcribe your speech.
            </li>
          </ol>
          <Button onClick={() => completeStep(3.1)} variant="outline" className="w-full">
            I've completed these steps
          </Button>
        </StepCard>

        <StepCard 
          stepNumber={4} 
          title="Get Transcription" 
          isCompleted={completedSteps[4]}
        >
          <p className="mb-4">
            After speaking for a few seconds, use this command to get the transcription:
          </p>
          <div className="relative">
            <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
              <code>{generateTranscriptCommand() || "Please enter your API key and Google Meet URL first"}</code>
            </pre>
            {generateTranscriptCommand() && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 px-3 py-1 flex items-center gap-1 shadow-sm border"
                onClick={() => copyToClipboard(generateTranscriptCommand(), "transcript", 4)}
              >
                {copied["transcript"] ? 
                  <>
                    <CheckIcon size={16} />
                    <span>Copied!</span>
                  </> : 
                  <>
                    <CopyIcon size={16} />
                    <span>Copy</span>
                  </>
                }
              </Button>
            )}
          </div>
        </StepCard>
        
        <StepCard
          stepNumber={4.1}
          title="Are Transcripts Coming Through?"
          isCompleted={completedSteps[4.1]}
          isSubstep={true}
        >
          <p className="mb-4">
            After running the command, check if you can see your transcripts in the response.
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={() => handleTranscriptResult(true)} 
              variant="outline" 
              className="flex-1 bg-green-50 hover:bg-green-100 border-green-200"
            >
              Yes, I see my transcripts
            </Button>
            <Button 
              onClick={() => handleTranscriptResult(false)} 
              variant="outline" 
              className="flex-1 bg-red-50 hover:bg-red-100 border-red-200"
            >
              No, I don't see transcripts
            </Button>
          </div>
        </StepCard>

        {showOptionalSteps && (
          <>
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-sm text-muted-foreground">
                  Optional Steps
                </span>
              </div>
            </div>
            
            <StepCard 
              stepNumber={5} 
              title="Change Language (Optional)" 
              isCompleted={completedSteps[5]}
            >
              <div className="mb-4">
                <label htmlFor="language" className="block text-sm font-medium mb-2">
                  Select language:
                </label>
                <select 
                  id="language" 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                  <option value="ru">Russian</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>
              <p className="mb-4">
                Use this command to change the bot's language:
              </p>
              <div className="relative">
                <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
                  <code>{generateChangeLangCommand() || "Please enter your API key and Google Meet URL first"}</code>
                </pre>
                {generateChangeLangCommand() && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 px-3 py-1 flex items-center gap-1 shadow-sm border"
                    onClick={() => copyToClipboard(generateChangeLangCommand(), "changeLang", 5)}
                  >
                    {copied["changeLang"] ? 
                      <>
                        <CheckIcon size={16} />
                        <span>Copied!</span>
                      </> : 
                      <>
                        <CopyIcon size={16} />
                        <span>Copy</span>
                      </>
                    }
                  </Button>
                )}
              </div>
            </StepCard>
          
            <StepCard 
              stepNumber={7} 
              title="List Your Meetings (Optional)" 
              isCompleted={completedSteps[7]}
            >
              <p className="mb-4">
                View a history of all your meetings:
              </p>
              <div className="relative">
                <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
                  <code>{generateListMeetingsCommand() || "Please enter your API key first"}</code>
                </pre>
                {generateListMeetingsCommand() && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 px-3 py-1 flex items-center gap-1 shadow-sm border"
                    onClick={() => copyToClipboard(generateListMeetingsCommand(), "listMeetings", 7)}
                  >
                    {copied["listMeetings"] ? 
                      <>
                        <CheckIcon size={16} />
                        <span>Copied!</span>
                      </> : 
                      <>
                        <CopyIcon size={16} />
                        <span>Copy</span>
                      </>
                    }
                  </Button>
                )}
              </div>
            </StepCard>
            
            <StepCard 
              stepNumber={8} 
              title="Check Bot Status (Optional)" 
              isCompleted={completedSteps[8]}
            >
              <p className="mb-4">
                Check the status of all your running bots:
              </p>
              <div className="relative">
                <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
                  <code>{generateBotStatusCommand() || "Please enter your API key first"}</code>
                </pre>
                {generateBotStatusCommand() && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 px-3 py-1 flex items-center gap-1 shadow-sm border"
                    onClick={() => copyToClipboard(generateBotStatusCommand(), "botStatus", 8)}
                  >
                    {copied["botStatus"] ? 
                      <>
                        <CheckIcon size={16} />
                        <span>Copied!</span>
                      </> : 
                      <>
                        <CopyIcon size={16} />
                        <span>Copy</span>
                      </>
                    }
                  </Button>
                )}
              </div>
            </StepCard>
          </>
        )}
        
        <StepCard 
          stepNumber={6} 
          title="Stop the Bot" 
          isCompleted={completedSteps[6]}
        >
          <p className="mb-4">
            When you're done, use this command to stop the bot:
          </p>
          <div className="relative">
            <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
              <code>{generateStopBotCommand() || "Please enter your API key and Google Meet URL first"}</code>
            </pre>
            {generateStopBotCommand() && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 px-3 py-1 flex items-center gap-1 shadow-sm border"
                onClick={() => copyToClipboard(generateStopBotCommand(), "stopBot", 6)}
              >
                {copied["stopBot"] ? 
                  <>
                    <CheckIcon size={16} />
                    <span>Copied!</span>
                  </> : 
                  <>
                    <CopyIcon size={16} />
                    <span>Copy</span>
                  </>
                }
              </Button>
            )}
          </div>
        </StepCard>
        
        {/* Transcript success/failure message at the bottom */}
        {transcriptSuccess !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-lg mt-8 text-white ${
              transcriptSuccess 
                ? "bg-gradient-to-r from-purple-500 to-indigo-600" 
                : "bg-gradient-to-r from-orange-400 to-red-500"
            }`}
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                {transcriptSuccess 
                  ? <TrophyIcon size={40} className="text-yellow-300" />
                  : <MessageSquareIcon size={40} className="text-white" />
                }
                <div>
                  <h3 className="text-2xl font-bold">
                    {transcriptSuccess ? "Congratulations!" : "No worries!"}
                  </h3>
                  <p className="mb-4">
                    {transcriptSuccess 
                      ? "Your bot is successfully transcribing your meeting! 🎉" 
                      : "We'll help you figure out what's happening with your transcripts."
                    }
                  </p>
                  <Link 
                    href="https://discord.gg/Ga9duGkVz9" 
                    target="_blank"
                    className={`inline-flex items-center gap-2 bg-white px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors ${
                      transcriptSuccess ? "text-purple-600" : "text-red-600"
                    }`}
                  >
                    <MessageSquareIcon size={18} />
                    {transcriptSuccess 
                      ? "Join our Discord community" 
                      : "Join our Discord for help"
                    }
                  </Link>
                </div>
              </div>
              
              {/* Connect with CEO section */}
              <div className="border-t border-white/20 pt-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <img 
                    src="https://media.licdn.com/dms/image/v2/C4D03AQFXWMxI1np6hg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1647969193758?e=1750896000&v=beta&t=-xq4LQ-_9gYfy57ZbNVOonH-mfe7hCd6IobEZ5PDtR4" 
                    alt="Dmitry Grankin, CEO of Vexa" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-white"
                  />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Connect with Dmitry Grankin, CEO of Vexa</h4>
                    <p className="mb-4">
                      {transcriptSuccess 
                        ? "Let's get to know each other! Share your usecase, I am really curious and want to help with your journey." 
                        : "I am here to help you resolve any issues you're facing."
                      }
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link 
                        href="https://www.linkedin.com/in/dmitry-grankin/" 
                        target="_blank"
                        className="inline-flex items-center gap-2 bg-[#0077B5] px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors text-white"
                      >
                        <LinkedinIcon size={18} />
                        Connect on LinkedIn
                      </Link>

                      <Link 
                        href="https://t.me/dmitrygrankin" 
                        target="_blank"
                        className="inline-flex items-center gap-2 bg-[#0088cc] px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors text-white"
                      >
                        <SendIcon size={18} />
                        Telegram
                      </Link>
                      <Link 
                        href="https://cal.com/dmitrygrankin/30-min" 
                        target="_blank"
                        className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors text-gray-800"
                      >
                        <CalendarIcon size={18} />
                        Book a Meeting
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 