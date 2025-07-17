import React, { useEffect, useState } from 'react';
import { BarChart3, FileText, Upload, HardDrive } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface DocumentStats {
  totalDocuments: number;
  recentUploads: number;
  totalSize: number;
  byType: {
    pdf: number;
    image: number;
    document: number;
    other: number;
  };
}

const DocumentAnalyticsWidget: React.FC<BaseWidgetProps> = (props) => {
  const [stats, setStats] = useState<DocumentStats>({
    totalDocuments: 0,
    recentUploads: 0,
    totalSize: 0,
    byType: { pdf: 0, image: 0, document: 0, other: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentStats();
  }, []);

  const fetchDocumentStats = async () => {
    try {
      // Get project documents
      const { data: projectDocs } = await supabase
        .from('project_documents')
        .select('file_type, file_size, created_at');

      // Get completion documents
      const { data: completionDocs } = await supabase
        .from('project_completion_documents')
        .select('file_type, file_size, created_at');

      const allDocs = [...(projectDocs || []), ...(completionDocs || [])];
      
      if (allDocs.length > 0) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const totalDocuments = allDocs.length;
        const recentUploads = allDocs.filter(doc => 
          new Date(doc.created_at) > weekAgo
        ).length;
        const totalSize = allDocs.reduce((sum, doc) => sum + (doc.file_size || 0), 0);

        const byType = {
          pdf: allDocs.filter(doc => doc.file_type?.toLowerCase().includes('pdf')).length,
          image: allDocs.filter(doc => 
            doc.file_type?.toLowerCase().includes('image') || 
            doc.file_type?.toLowerCase().includes('jpeg') ||
            doc.file_type?.toLowerCase().includes('png')
          ).length,
          document: allDocs.filter(doc => 
            doc.file_type?.toLowerCase().includes('doc') ||
            doc.file_type?.toLowerCase().includes('txt') ||
            doc.file_type?.toLowerCase().includes('rtf')
          ).length,
          other: 0
        };
        
        byType.other = totalDocuments - (byType.pdf + byType.image + byType.document);

        setStats({ totalDocuments, recentUploads, totalSize, byType });
      }
    } catch (error) {
      console.error('Error fetching document stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <BaseWidget
      {...props}
      title="Document Analytics"
      icon={BarChart3}
    >
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{stats.totalDocuments}</div>
            <div className="text-sm text-gray-400">Total Documents</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-300">Recent</span>
              </div>
              <span className="font-semibold text-white">{stats.recentUploads}</span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-300">Size</span>
              </div>
              <span className="font-semibold text-white text-xs">{formatFileSize(stats.totalSize)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm text-gray-400 font-medium">File Types</h4>
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-300 capitalize">{type}</span>
                </div>
                <span className="text-xs font-semibold text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </BaseWidget>
  );
};

export default DocumentAnalyticsWidget;