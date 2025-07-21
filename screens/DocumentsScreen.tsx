import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

interface Document {
  id: string;
  name: string;
  type: 'blueprint' | 'contract' | 'permit' | 'photo' | 'report' | 'other';
  size: string;
  uploadDate: string;
  uploadedBy: string;
  shared: boolean;
}

export default function DocumentsScreen({ navigation, route }) {
  const { projectId } = route?.params || {};
  
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Floor Plans - Level 1.pdf',
      type: 'blueprint',
      size: '2.4 MB',
      uploadDate: '2024-01-15',
      uploadedBy: 'John Smith',
      shared: true,
    },
    {
      id: '2',
      name: 'Building Permit Application.pdf',
      type: 'permit',
      size: '1.8 MB',
      uploadDate: '2024-01-12',
      uploadedBy: 'Sarah Johnson',
      shared: false,
    },
    {
      id: '3',
      name: 'Site Photos - Foundation.zip',
      type: 'photo',
      size: '15.6 MB',
      uploadDate: '2024-01-10',
      uploadedBy: 'Mike Davis',
      shared: true,
    },
    {
      id: '4',
      name: 'Structural Engineering Report.pdf',
      type: 'report',
      size: '4.2 MB',
      uploadDate: '2024-01-08',
      uploadedBy: 'Lisa Chen',
      shared: true,
    },
    {
      id: '5',
      name: 'Construction Contract.pdf',
      type: 'contract',
      size: '890 KB',
      uploadDate: '2024-01-05',
      uploadedBy: 'John Smith',
      shared: false,
    },
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedType, setSelectedType] = useState('other');
  const [newDocument, setNewDocument] = useState({ name: '', type: 'other' });

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'blueprint':
        return 'construct';
      case 'contract':
        return 'document-text';
      case 'permit':
        return 'checkmark-circle';
      case 'photo':
        return 'camera';
      case 'report':
        return 'bar-chart';
      default:
        return 'document';
    }
  };

  const getDocumentColor = (type: string) => {
    switch (type) {
      case 'blueprint':
        return '#3b82f6';
      case 'contract':
        return '#f59e0b';
      case 'permit':
        return '#10b981';
      case 'photo':
        return '#8b5cf6';
      case 'report':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'blueprint':
        return 'Blueprint';
      case 'contract':
        return 'Contract';
      case 'permit':
        return 'Permit';
      case 'photo':
        return 'Photo';
      case 'report':
        return 'Report';
      default:
        return 'Document';
    }
  };

  const handleUploadDocument = () => {
    // In a real app, you would implement actual file upload functionality
    // This could use Expo DocumentPicker and integrate with cloud storage
    Alert.alert(
      'Upload Document',
      'Document upload functionality would be implemented here with file picker and cloud storage integration.',
      [{ text: 'OK' }]
    );
  };

  const handleOpenDocument = (document: Document) => {
    Alert.alert(
      'Open Document',
      `Opening: ${document.name}\n\nIn a real app, this would open the document viewer or download the file.`,
      [{ text: 'OK' }]
    );
  };

  const handleShareDocument = (document: Document) => {
    const updatedDocuments = documents.map(doc => 
      doc.id === document.id ? { ...doc, shared: !doc.shared } : doc
    );
    setDocuments(updatedDocuments);
    
    Alert.alert(
      'Document Sharing',
      `Document ${document.shared ? 'unshared' : 'shared'} successfully!`
    );
  };

  const DocumentCard = ({ document }: { document: Document }) => (
    <TouchableOpacity 
      style={styles.documentCard}
      onPress={() => handleOpenDocument(document)}
    >
      <View style={styles.documentHeader}>
        <View style={styles.documentIcon}>
          <Ionicons 
            name={getDocumentIcon(document.type)} 
            size={24} 
            color={getDocumentColor(document.type)} 
          />
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentName} numberOfLines={2}>{document.name}</Text>
          <View style={styles.documentMeta}>
            <Text style={styles.documentType}>{getDocumentTypeLabel(document.type)}</Text>
            <Text style={styles.documentSize}>{document.size}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={() => handleShareDocument(document)}
        >
          <Ionicons 
            name={document.shared ? 'people' : 'person'} 
            size={20} 
            color={document.shared ? '#10b981' : '#6b7280'} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.documentFooter}>
        <Text style={styles.uploadInfo}>
          Uploaded by {document.uploadedBy} on {document.uploadDate}
        </Text>
        {document.shared && (
          <View style={styles.sharedBadge}>
            <Text style={styles.sharedText}>Shared</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const documentTypes = [
    { value: 'blueprint', label: 'Blueprint' },
    { value: 'contract', label: 'Contract' },
    { value: 'permit', label: 'Permit' },
    { value: 'photo', label: 'Photo' },
    { value: 'report', label: 'Report' },
    { value: 'other', label: 'Other' },
  ];

  const filteredDocuments = documents;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Documents</Text>
          <Text style={styles.subtitle}>
            {projectId ? 'Project documents and files' : 'All your documents and files'}
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUploadDocument}
          >
            <Ionicons name="cloud-upload" size={20} color="#fff" />
            <Text style={styles.uploadButtonText}>Upload Document</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => Alert.alert('Camera Scan', 'Document scanning functionality would be implemented here using the device camera.')}
          >
            <Ionicons name="camera" size={20} color="#10b981" />
            <Text style={styles.scanButtonText}>Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Document Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{documents.length}</Text>
            <Text style={styles.statLabel}>Total Documents</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{documents.filter(d => d.shared).length}</Text>
            <Text style={styles.statLabel}>Shared</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {Math.round(documents.reduce((acc, doc) => {
                const size = parseFloat(doc.size);
                const unit = doc.size.split(' ')[1];
                return acc + (unit === 'MB' ? size : size / 1000);
              }, 0) * 10) / 10} MB
            </Text>
            <Text style={styles.statLabel}>Total Size</Text>
          </View>
        </View>

        {/* Documents List */}
        <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>Recent Documents</Text>
          <View style={styles.documentsList}>
            {filteredDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </View>
        </View>

        {documents.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#6b7280" />
            <Text style={styles.emptyTitle}>No Documents Yet</Text>
            <Text style={styles.emptyDescription}>
              Upload your first document to get started
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  scanButtonText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  documentsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  documentsList: {
    gap: 12,
  },
  documentCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#374151',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentType: {
    fontSize: 12,
    color: '#10b981',
    backgroundColor: '#10b981' + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  documentSize: {
    fontSize: 12,
    color: '#9ca3af',
  },
  shareButton: {
    padding: 8,
  },
  documentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  uploadInfo: {
    fontSize: 12,
    color: '#9ca3af',
    flex: 1,
  },
  sharedBadge: {
    backgroundColor: '#10b981' + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sharedText: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
});