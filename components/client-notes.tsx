'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  FileText,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface ClientNote {
  id: string
  clientId: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

interface ClientNotesProps {
  clientId: string
  clientName: string
}

export function ClientNotes({ clientId, clientName }: ClientNotesProps) {
  const [notes, setNotes] = useState<ClientNote[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [newNote, setNewNote] = useState({ title: '', content: '' })
  const [editNote, setEditNote] = useState({ title: '', content: '' })

  useEffect(() => {
    loadNotes()
  }, [clientId])

  const loadNotes = () => {
    try {
      const savedNotes = localStorage.getItem(`client_notes_${clientId}`)
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes))
      }
    } catch (error) {
      console.error('Error loading client notes:', error)
    }
  }

  const saveNotes = (updatedNotes: ClientNote[]) => {
    try {
      localStorage.setItem(`client_notes_${clientId}`, JSON.stringify(updatedNotes))
      setNotes(updatedNotes)
    } catch (error) {
      console.error('Error saving client notes:', error)
    }
  }

  const handleCreateNote = () => {
    if (!newNote.title.trim()) return

    const note: ClientNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientId,
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedNotes = [note, ...notes]
    saveNotes(updatedNotes)
    setNewNote({ title: '', content: '' })
    setIsCreating(false)
  }

  const handleUpdateNote = (noteId: string) => {
    if (!editNote.title.trim()) return

    const updatedNotes = notes.map(note => 
      note.id === noteId 
        ? { 
            ...note, 
            title: editNote.title.trim(), 
            content: editNote.content.trim(),
            updatedAt: new Date().toISOString()
          }
        : note
    )
    
    saveNotes(updatedNotes)
    setEditingNote(null)
    setEditNote({ title: '', content: '' })
  }

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Delete this note?')) {
      const updatedNotes = notes.filter(note => note.id !== noteId)
      saveNotes(updatedNotes)
    }
  }

  const startEditing = (note: ClientNote) => {
    setEditingNote(note.id)
    setEditNote({ title: note.title, content: note.content })
  }

  const cancelEditing = () => {
    setEditingNote(null)
    setEditNote({ title: '', content: '' })
  }

  const cancelCreating = () => {
    setIsCreating(false)
    setNewNote({ title: '', content: '' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Notes for {clientName}</h2>
          <p className="text-gray-600">{notes.length} notes saved</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isCreating}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>

      {/* Create New Note */}
      {isCreating && (
        <Card className="bg-white shadow-sm border-gray-200 border-blue-200">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Input
                placeholder="Note title..."
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className="font-medium"
              />
              <textarea
                placeholder="Write your note here..."
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
              <div className="flex items-center justify-end space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={cancelCreating}
                >
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleCreateNote}
                  disabled={!newNote.title.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="mr-1 h-4 w-4" />
                  Save Note
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first note for {clientName}
              </p>
              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          notes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-white shadow-sm border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {editingNote === note.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editNote.title}
                        onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                        className="font-medium"
                      />
                      <textarea
                        value={editNote.content}
                        onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                      />
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={cancelEditing}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleUpdateNote(note.id)}
                          disabled={!editNote.title.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="mr-1 h-4 w-4" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{note.title}</h4>
                          {note.content && (
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{note.content}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(note)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                        {note.updatedAt !== note.createdAt && (
                          <div className="flex items-center space-x-1">
                            <Edit className="h-3 w-3" />
                            <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
