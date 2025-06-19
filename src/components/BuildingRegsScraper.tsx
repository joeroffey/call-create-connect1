
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Download, Key, AlertCircle, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { FirecrawlService } from '@/utils/FirecrawlService';

interface BuildingRegsScraper {
  onBack: () => void;
}

const BuildingRegsScraper = ({ onBack }: BuildingRegsScraper) => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [hasValidKey, setHasValidKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState(0);
  const [crawlResults, setCrawlResults] = useState<any>(null);
  const [step, setStep] = useState<'setup' | 'crawl' | 'results'>('setup');

  React.useEffect(() => {
    const savedKey = FirecrawlService.getApiKey();
    if (savedKey) {
      setApiKey(savedKey);
      setHasValidKey(true);
      setStep('crawl');
    }
  }, []);

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Firecrawl API key",
        variant: "destructive",
      });
      return;
    }

    setIsTestingKey(true);
    try {
      const isValid = await FirecrawlService.testApiKey(apiKey);
      if (isValid) {
        FirecrawlService.saveApiKey(apiKey);
        setHasValidKey(true);
        setStep('crawl');
        toast({
          title: "Success",
          description: "API key validated and saved",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid API key. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate API key",
        variant: "destructive",
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleStartCrawl = async () => {
    setIsCrawling(true);
    setCrawlProgress(0);
    setCrawlResults(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setCrawlProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      const result = await FirecrawlService.crawlBuildingRegulations();

      clearInterval(progressInterval);
      setCrawlProgress(100);

      if (result.success) {
        setCrawlResults(result.data);
        setStep('results');
        toast({
          title: "Success",
          description: "Building regulations crawled successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to crawl building regulations",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error crawling:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCrawling(false);
    }
  };

  const renderSetupStep = () => (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Key className="w-5 h-5 text-emerald-400" />
          Firecrawl API Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-500/10 border-blue-500/20">
          <AlertCircle className="w-4 h-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            You'll need a Firecrawl API key to scrape the UK Government building regulations website.
            Get one at <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="underline">firecrawl.dev</a>
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <label htmlFor="apiKey" className="text-sm font-medium text-gray-300">
            Firecrawl API Key
          </label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="fc-..."
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <Button
          onClick={handleTestApiKey}
          disabled={isTestingKey || !apiKey.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {isTestingKey ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Test & Save API Key
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  const renderCrawlStep = () => (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Globe className="w-5 h-5 text-emerald-400" />
          Crawl Building Regulations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-emerald-500/10 border-emerald-500/20">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <AlertDescription className="text-emerald-300">
            API key configured successfully. Ready to crawl UK building regulations.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-gray-300 text-sm">
            This will crawl the official UK Government building regulations website and extract the latest content.
          </p>
          <p className="text-gray-400 text-sm">
            Target: https://www.gov.uk/building-regulations-approval
          </p>
        </div>

        {isCrawling && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-gray-400">{crawlProgress}%</span>
            </div>
            <Progress value={crawlProgress} className="bg-gray-800" />
          </div>
        )}

        <Button
          onClick={handleStartCrawl}
          disabled={isCrawling}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {isCrawling ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Crawling...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Start Crawl
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  const renderResultsStep = () => (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          Crawl Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {crawlResults && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="text-gray-400">Status</div>
                <div className="text-white font-medium">{crawlResults.status}</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="text-gray-400">Pages Crawled</div>
                <div className="text-white font-medium">{crawlResults.completed}/{crawlResults.total}</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="text-gray-400">Credits Used</div>
                <div className="text-white font-medium">{crawlResults.creditsUsed}</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="text-gray-400">Data Points</div>
                <div className="text-white font-medium">{crawlResults.data?.length || 0}</div>
              </div>
            </div>

            <div className="bg-gray-800/30 p-4 rounded max-h-60 overflow-auto">
              <h4 className="text-white font-medium mb-2">Sample Data</h4>
              <pre className="text-xs text-gray-300">
                {JSON.stringify(crawlResults.data?.slice(0, 2), null, 2)}
              </pre>
            </div>

            <Alert className="bg-amber-500/10 border-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <AlertDescription className="text-amber-300">
                This is test data. The next step would be to process this content and update your vector database.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setStep('crawl');
              setCrawlResults(null);
            }}
            variant="outline"
            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Crawl Again
          </Button>
          <Button
            onClick={() => setStep('setup')}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Change API Key
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 bg-black text-white">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-800 p-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Building Regulations Scraper</h1>
              <p className="text-gray-400">Automated content extraction from gov.uk</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {step === 'setup' && renderSetupStep()}
              {step === 'crawl' && renderCrawlStep()}
              {step === 'results' && renderResultsStep()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingRegsScraper;
