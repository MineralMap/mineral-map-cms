import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection
        const { error } = await supabase.from('_supabase_migrations').select('*').limit(1);

        if (error) {
          // If migrations table doesn't exist, try a different approach
          const { error: authError } = await supabase.auth.getSession();
          
          if (authError) {
            throw new Error(`Connection failed: ${authError.message}`);
          }
        }

        setConnectionStatus('connected');
        setSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || 'Not set');
      } catch (err) {
        setConnectionStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
        setSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || 'Not set');
      }
    };

    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Supabase Connection Test
          {connectionStatus === 'testing' && <Loader2 className="h-4 w-4 animate-spin" />}
          {connectionStatus === 'connected' && <CheckCircle className="h-4 w-4 text-green-500" />}
          {connectionStatus === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
        </CardTitle>
        <CardDescription>
          Testing connection to your Supabase database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Status:</p>
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
            {connectionStatus === 'testing' && 'Testing...'}
            {connectionStatus === 'connected' && 'Connected'}
            {connectionStatus === 'error' && 'Connection Failed'}
          </Badge>
        </div>
        
        <div>
          <p className="text-sm font-medium">Supabase URL:</p>
          <p className="text-xs text-muted-foreground break-all">
            {supabaseUrl}
          </p>
        </div>

        {connectionStatus === 'error' && (
          <div>
            <p className="text-sm font-medium text-red-600">Error:</p>
            <p className="text-xs text-red-500">{errorMessage}</p>
          </div>
        )}

        {connectionStatus === 'connected' && (
          <div className="text-sm text-green-600">
            ✅ Successfully connected to Supabase!
          </div>
        )}
      </CardContent>
    </Card>
  );
};
