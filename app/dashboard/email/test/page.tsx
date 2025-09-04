'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function TestEmailPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sendTestEmail = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test-email');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Failed to send test email' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Test Email Sending</h1>
      <Button onClick={sendTestEmail} disabled={loading}>
        {loading ? 'Sending...' : 'Send Test Email'}
      </Button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
          {result.data?.previewUrl && (
            <a 
              href={result.data.previewUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline mt-2 block"
            >
              View in Mailtrap
            </a>
          )}
        </div>
      )}
    </div>
  );
}
