import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Folder, 
  FolderOpen, 
  FolderPlus, 
  Lock, 
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Home,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFolders, type CompletionDocumentFolder } from '@/hooks/useFolders';
import { FolderAccessModal } from './FolderAccessModal';

interface FolderTreeViewProps {
  projectId: string;
  teamId: string;
  currentFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  canCreateFolders?: boolean;
  canManageAccess?: boolean;
}

export const FolderTreeView: React.FC<FolderTreeViewProps> = ({
  projectId,
  teamId,
  currentFolderId,
  onFolderSelect,
  canCreateFolders = false,
  canManageAccess = false,
}) => {
  const { folders, createFolder, deleteFolder, getRootFolders, getSubFolders } = useFolders(projectId, teamId);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  const [accessModalFolder, setAccessModalFolder] = useState<CompletionDocumentFolder | null>(null);

  const toggleFolderExpansion = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    const success = await createFolder(newFolderName, parentFolderId);
    if (success) {
      setShowCreateDialog(false);
      setNewFolderName('');
      setParentFolderId(null);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (window.confirm('Are you sure you want to delete this folder? All documents inside will be moved to the project root.')) {
      await deleteFolder(folderId);
    }
  };

  const renderFolder = (folder: CompletionDocumentFolder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = currentFolderId === folder.id;
    const subFolders = getSubFolders(folder.id);
    const hasSubFolders = subFolders.length > 0;

    return (
      <div key={folder.id}>
        <div 
          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent ${
            isSelected ? 'bg-accent' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {hasSubFolders && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-4 w-4"
              onClick={() => toggleFolderExpansion(folder.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          
          <div 
            className="flex items-center gap-2 flex-1"
            onClick={() => onFolderSelect(folder.id)}
          >
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm truncate">{folder.name}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canCreateFolders && (
                <DropdownMenuItem 
                  onClick={() => {
                    setParentFolderId(folder.id);
                    setShowCreateDialog(true);
                  }}
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Subfolder
                </DropdownMenuItem>
              )}
              {canManageAccess && (
                <DropdownMenuItem onClick={() => setAccessModalFolder(folder)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Access
                </DropdownMenuItem>
              )}
              {canCreateFolders && (
                <DropdownMenuItem 
                  onClick={() => handleDeleteFolder(folder.id)}
                  className="text-destructive"
                >
                  Delete Folder
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {isExpanded && subFolders.map(subFolder => 
          renderFolder(subFolder, level + 1)
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Root folder */}
      <div 
        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent ${
          currentFolderId === null ? 'bg-accent' : ''
        }`}
        onClick={() => onFolderSelect(null)}
      >
        <Home className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Project Root</span>
      </div>

      {/* Root-level folders */}
      {getRootFolders().map(folder => renderFolder(folder))}

      {/* Create folder button */}
      {canCreateFolders && (
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            setParentFolderId(null);
            setShowCreateDialog(true);
          }}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
      )}

      {/* Create folder dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Folder access modal */}
      {accessModalFolder && (
        <FolderAccessModal
          isOpen={true}
          onClose={() => setAccessModalFolder(null)}
          folderId={accessModalFolder.id}
          teamId={teamId}
          folderName={accessModalFolder.name}
        />
      )}
    </div>
  );
};