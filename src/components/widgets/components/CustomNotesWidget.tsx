import React, { useEffect, useState } from 'react';
import { StickyNote, Plus, Edit3, Trash2 } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Note {
  id: string;
  content: string;
  created_at: string;
  color: string;
}

const CustomNotesWidget: React.FC<BaseWidgetProps> = (props) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const savedNotes = localStorage.getItem('widget-notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  };

  const saveNotes = (updatedNotes: Note[]) => {
    localStorage.setItem('widget-notes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const addNote = () => {
    if (!newNoteContent.trim()) return;

    const colors = ['#fef3c7', '#fecaca', '#c7d2fe', '#d1fae5', '#fed7d7', '#e0e7ff'];
    const newNote: Note = {
      id: Date.now().toString(),
      content: newNoteContent.trim(),
      created_at: new Date().toISOString(),
      color: colors[Math.floor(Math.random() * colors.length)]
    };

    const updatedNotes = [newNote, ...notes];
    saveNotes(updatedNotes);
    setNewNoteContent('');
    setIsEditing(false);
  };

  const updateNote = (id: string, content: string) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, content: content.trim() } : note
    );
    saveNotes(updatedNotes);
    setEditingNote(null);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <BaseWidget
      {...props}
      title="Custom Notes"
      icon={StickyNote}
    >
      <div className="space-y-3">
        {/* Add note section */}
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Write your note..."
              className="min-h-[60px] bg-gray-800 border-gray-600 text-white resize-none"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={addNote} disabled={!newNoteContent.trim()}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => {
                setIsEditing(false);
                setNewNoteContent('');
              }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="w-full border border-gray-700 border-dashed hover:border-gray-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        )}

        {/* Notes list */}
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <StickyNote className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No notes yet</p>
            <p className="text-gray-500 text-xs mt-1">Add a note to get started</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notes.map(note => (
              <div
                key={note.id}
                className="p-3 rounded border border-gray-700 bg-gray-800/30 group relative"
              >
                {editingNote?.id === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      defaultValue={note.content}
                      onBlur={(e) => updateNote(note.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          updateNote(note.id, e.currentTarget.value);
                        }
                        if (e.key === 'Escape') {
                          setEditingNote(null);
                        }
                      }}
                      className="min-h-[60px] bg-gray-700 border-gray-600 text-white resize-none"
                      autoFocus
                    />
                    <div className="text-xs text-gray-500">
                      Press Ctrl+Enter to save, Esc to cancel
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingNote(note)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNote(note.id)}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="pr-16">
                      <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        {formatDate(note.created_at)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default CustomNotesWidget;