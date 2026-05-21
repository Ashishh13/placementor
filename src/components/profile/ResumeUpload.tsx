'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Upload, FileText, CheckCircle2, Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  userId: string
  currentUrl: string
  onUpload: (url: string) => void
}

export default function ResumeUpload({ userId, currentUrl, onUpload }: Props) {
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string>('')
  const supabase = createClient()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max 5MB.')
      return
    }

    setUploading(true)
    setFileName(file.name)

    const filePath = `${userId}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, { upsert: true })

    if (error) {
      toast.error('Upload failed: ' + error.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath)

    onUpload(publicUrl)
    toast.success('Resume uploaded!')
    setUploading(false)
  }, [userId, supabase, onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:border-violet-500/50 hover:bg-white/5'
        }`}
      >
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
              <p className="text-zinc-300 text-sm">Uploading {fileName}...</p>
            </motion.div>
          ) : currentUrl ? (
            <motion.div key="uploaded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <p className="text-white text-sm font-medium">Resume uploaded!</p>
              <p className="text-zinc-500 text-xs">Drop a new file to replace it</p>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Drop your resume here</p>
                <p className="text-zinc-500 text-xs mt-1">PDF, DOC, DOCX — Max 5MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {currentUrl && (
        <a href={currentUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-3 text-violet-400 hover:text-violet-300 text-sm transition-colors">
          <FileText className="w-3.5 h-3.5" /> View current resume
        </a>
      )}
    </div>
  )
}