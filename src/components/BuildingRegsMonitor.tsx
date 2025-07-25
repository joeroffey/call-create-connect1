
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Clock, CheckCircle, XCircle, PlayCircle } from 'lucide-react';

interface UpdateRecord {
  id: string;
  update_date: string;
  pages_crawled: number | null;
  chunks_processed: number | null;
  vectors_created: number | null;
  status: string;
  error_message: string | null;
}

const BuildingRegsMonitor = () => {
  const { toast } = useToast();
  const [updates, setUpdates] = useState<UpdateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);

  const fetchUpdates = async () => {
    try {
      console.log('Fetching building regulations updates...');
      // Use type assertion to bypass TypeScript error for the RPC function
      const { data, error } = await (supabase as any).rpc('fetch_building_regs_updates');

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }

      console.log('Successfully fetched updates:', data);
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch update history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerUpdate = async () => {
    setIsTriggering(true);
    try {
      const { data, error } = await supabase.functions.invoke('building-regs-updater');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Building regulations update triggered successfully",
      });
      
      // Refresh the updates list after a delay
      setTimeout(fetchUpdates, 2000);
    } catch (error) {
      console.error('Error triggering update:', error);
      toast({
        title: "Error",
        description: "Failed to trigger building regulations update",
        variant: "destructive",
      });
    } finally {
      setIsTriggering(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Building Regulations Updates Monitor
            <div className="space-x-2">
              <Button
                onClick={fetchUpdates}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={triggerUpdate}
                size="sm"
                disabled={isTriggering}
              >
                <PlayCircle className={`w-4 h-4 mr-2 ${isTriggering ? 'animate-spin' : ''}`} />
                {isTriggering ? 'Triggering...' : 'Trigger Update'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading update history...</div>
          ) : updates.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No updates found</div>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(update.status)}
                    <div>
                      <div className="font-medium">
                        {new Date(update.update_date).toLocaleString()}
                      </div>
                      <div className={`text-sm ${getStatusColor(update.status)}`}>
                        Status: {update.status}
                      </div>
                      {update.error_message && (
                        <div className="text-xs text-red-500 mt-1">
                          {update.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                  {update.status === 'completed' && (
                    <div className="text-right text-sm text-gray-600">
                      <div>Pages: {update.pages_crawled}</div>
                      <div>Chunks: {update.chunks_processed}</div>
                      <div>Vectors: {update.vectors_created}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BuildingRegsMonitor;
