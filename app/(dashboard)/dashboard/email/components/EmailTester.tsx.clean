'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircle, 
  Smartphone, 
  Tablet, 
  Monitor, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Upload, 
  FileText, 
  X,
  FileIcon,
  FileUpIcon
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { COMMON_DEVICES } from '../types/email';
import { Progress } from '@/components/ui/progress';

interface TestResult {
  device: string;
  screenshot: string;
  warnings: string[];
  success: boolean;
  error?: string;
}

interface EmailTesterProps {
  initialHtml?: string;
  onFileProcessed?: (html: string, metadata?: any) => void;
  className?: string;
}

export function EmailTester({ 
  initialHtml = '', 
  onFileProcessed, 
  className = '' 
}: EmailTesterProps) {
  const [emailHtml, setEmailHtml] = useState(initialHtml);
  const [isTesting, setIsTesting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const [activeTab, setActiveTab] = useState(initialHtml ? 'preview' : 'editor');
  const [error, setError] = useState<string | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<Record<string, boolean>>({
    iphone15: true,
    pixel7: true,
    ipadPro: true,
    desktop: true,
  });
  const [fileInfo, setFileInfo] = useState<{name: string; size: number; type: string} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const testEmailOnDevices = useCallback(async () => {
    if (!emailHtml.trim()) {
      setError('Please enter some HTML content to test');
      return;
    }

    setIsTesting(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/dashboard/email/api/device-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          emailHtml,
          devices: Object.entries(selectedDevices)
            .filter(([_, selected]) => selected)
            .map(([device]) => device)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to test email');
      }

      const data = await response.json();
      setResults(data.results || []);
      setActiveTab('preview');
    } catch (error: any) {
      console.error('Error testing email:', error);
      setError(error.message || 'Failed to test email');
      toast.error('Error testing email', {
        description: error.message || 'An unknown error occurred',
      });
    } finally {
      setIsTesting(false);
    }
  }, [emailHtml, selectedDevices]);

  const processFile = async (file: File) => {
    if (!file) return null;

    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.type || file.name.split('.').pop()?.toUpperCase() || 'FILE'
    });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/dashboard/email/api/process', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process email file');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setUploadProgress(0);
    setError(null);

    try {
      const data = await processFile(file);
      setUploadProgress(100);
      
      if (data?.data?.html) {
        setEmailHtml(data.data.html);
        setActiveTab('preview');
        onFileProcessed?.(data.data.html, {
          ...data.data.metadata,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || file.name.split('.').pop()?.toUpperCase() || 'FILE'
        });
        toast.success('Email processed successfully');
      } else if (data?.data?.text) {
        setEmailHtml(`<pre>${data.data.text}</pre>`);
        setActiveTab('preview');
        onFileProcessed?.(data.data.text, {
          ...data.data.metadata,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || file.name.split('.').pop()?.toUpperCase() || 'FILE'
        });
        toast.success('Email processed successfully');
      } else {
        throw new Error('No valid content found in the processed email');
      }
    } catch (error: any) {
      console.error('Error processing file:', error);
      setError(error.message || 'Failed to process email file');
      toast.error('Error processing email', {
        description: error.message || 'An unknown error occurred',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const validTypes = [
        'message/rfc822', // .eml
        'application/vnd.ms-outlook', // .msg
        'application/octet-stream', // .pst, .mbox
        'text/plain',
        'text/html',
        'application/json'
      ];
      
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const isValidType = validTypes.includes(file.type) || 
                        ['.eml', '.msg', '.pst', '.mbox', '.txt', '.html', '.json'].includes('.' + fileExt);
      
      if (isValidType) {
        handleFileUpload(file);
      } else {
        setError(`Unsupported file type: ${file.type || fileExt}`);
        toast.error('Unsupported file type', {
          description: 'Please upload a valid email file (.eml, .msg, .pst, .mbox) or HTML file',
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getDeviceIcon = (deviceName: string) => {
    if (deviceName.includes('iphone')) return <Smartphone className="w-4 h-4" />;
    if (deviceName.includes('pixel')) return <Smartphone className="w-4 h-4" />;
    if (deviceName.includes('ipad')) return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
            <div className="space-y-1">
              <CardTitle>Email Tester</CardTitle>
              <CardDescription>Test your email across different devices and clients</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".eml,.msg,.mbox,.pst,.html,.txt"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileInput}
                disabled={isProcessing || isTesting}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Email File
              </Button>
              <Button 
                onClick={testEmailOnDevices} 
                disabled={isTesting || isProcessing || !emailHtml.trim()}
                className="flex items-center gap-2"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Test on Selected Devices
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview" disabled={!emailHtml.trim()}>
                  Preview
                </TabsTrigger>
              </TabsList>
              
              {activeTab === 'preview' && (
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center sm:justify-end">
                  {Object.entries(selectedDevices).map(([device, selected]) => (
                    <Button
                      key={device}
                      variant={selected ? 'default' : 'outline'}
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setSelectedDevices(prev => ({
                          ...prev,
                          [device]: !prev[device]
                        }));
                      }}
                    >
                      {selected && <CheckCircle2 className="h-4 w-4" />}
                      {device.charAt(0).toUpperCase() + device.slice(1)}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {isProcessing && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing email file...
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="editor">
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !isProcessing && triggerFileInput()}
              >
                {isDragging ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Upload className="h-12 w-12 text-primary" />
                    <p className="font-medium">Drop your email file here</p>
                    <p className="text-sm text-muted-foreground">Supports .eml, .msg, .pst, .mbox, .html, .txt</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Drag and drop your email file here, or click to browse</p>
                      <p className="text-sm text-muted-foreground">Supports .eml, .msg, .pst, .mbox, .html, .txt</p>
                    </div>
                  </div>
                )}
              </div>
              
              {fileInfo && (
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mt-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{fileInfo.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(fileInfo.size)} • {fileInfo.type}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileInfo(null);
                      setEmailHtml('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="email-html">Email Content</Label>
                  <span className="text-xs text-muted-foreground">
                    {emailHtml.length} characters • {emailHtml.split('\n').length} lines
                  </span>
                </div>
                <Textarea
                  id="email-html"
                  value={emailHtml}
                  onChange={(e) => setEmailHtml(e.target.value)}
                  placeholder="Paste your HTML email content here or upload a file..."
                  className="min-h-[300px] font-mono text-sm"
                  disabled={isProcessing}
                />
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={testEmailOnDevices}
                  disabled={isTesting || isProcessing || !emailHtml.trim()}
                  className="gap-2"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Test on Selected Devices
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              {isTesting ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Testing on selected devices...</p>
                  <Progress 
                    value={Object.values(selectedDevices).filter(Boolean).length / Object.keys(selectedDevices).length * 100} 
                    className="h-2 w-full max-w-md" 
                  />
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((result, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 p-2 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(result.device)}
                          <span className="font-medium">
                            {result.device.charAt(0).toUpperCase() + result.device.slice(1)}
                          </span>
                        </div>
                        {result.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div className="p-4 bg-background">
                        {result.screenshot ? (
                          <img 
                            src={`data:image/png;base64,${result.screenshot}`} 
                            alt={`${result.device} preview`}
                            className="w-full h-auto border rounded"
                          />
                        ) : (
                          <div className="p-8 text-center text-muted-foreground">
                            <p>No preview available</p>
                            {result.error && (
                              <p className="text-sm text-destructive mt-2">{result.error}</p>
                            )}
                          </div>
                        )}
                        
                        {result.warnings && result.warnings.length > 0 && (
                          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-sm">
                            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Warnings
                            </h4>
                            <ul className="mt-1 list-disc list-inside space-y-1">
                              {result.warnings.map((warning, i) => (
                                <li key={i} className="text-yellow-700 dark:text-yellow-300">
                                  {warning}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No test results yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Upload an email file or paste your HTML content and click "Test on Selected Devices" to see previews.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
