"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

interface FileItem {
  id: number
  filename: string
  filesize: number
  filetype: string
  upload_date: string
  base64data: string
  is_public: boolean
  public_link?: string
}

interface FileListProps {
  user: { publicKey: string; nickname: string }
  refreshTrigger?: number
}

export function FileList({ user, refreshTrigger }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFiles()
  }, [user])

  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchFiles()
    }
  }, [refreshTrigger])

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/files/list?userPublicKey=${user.publicKey}`)
      const result = await response.json()

      if (result.success) {
        setFiles(result.files)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const downloadFile = (file: FileItem) => {
    const link = document.createElement("a")
    link.href = `data:${file.filetype};base64,${file.base64data}`
    link.download = file.filename
    link.click()
  }

  const shareFile = async (file: FileItem) => {
    const shareUrl = `${window.location.origin}/file/${file.id}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Share link",
        description: shareUrl,
      })
    }
  }

  const deleteFile = async (fileId: number) => {
    try {
      const response = await fetch("/api/files/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, userPublicKey: user.publicKey }),
      })

      const result = await response.json()

      if (result.success) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId))
        toast({
          title: "File deleted",
          description: "File deleted successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const togglePublic = async (fileId: number, isPublic: boolean) => {
    try {
      const response = await fetch("/api/files/toggle-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          isPublic: !isPublic,
          userPublicKey: user.publicKey,
        }),
      })

      const result = await response.json()

      if (result.success) {
        fetchFiles() // Refresh the list
        toast({
          title: result.isPublic ? "🌐 File is now public" : "🔒 File is now private",
          description: result.isPublic
            ? `Anyone can download this file using: ${window.location.origin}/share/${result.publicLink}`
            : "File is now private and only you can access it",
          duration: 5000,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update file visibility",
        variant: "destructive",
      })
    }
  }

  const copyPublicLink = async (publicLink: string) => {
    const shareUrl = `${window.location.origin}/share/${publicLink}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "🔗 Link copied!",
        description: "Public download link copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Public link",
        description: shareUrl,
      })
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/20 border-orange-300/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <p className="text-white text-center">Loading your files...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/20 border-orange-300/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Your Files ({files.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <p className="text-orange-100 text-center py-8">No files uploaded yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div key={file.id} className="bg-white/20 rounded-lg p-4">
                <div className="relative aspect-square mb-3">
                  <Image
                    src={`data:${file.filetype};base64,${file.base64data}`}
                    alt={file.filename}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <h4 className="text-white font-medium truncate mb-1">{file.filename}</h4>
                <p className="text-orange-100 text-sm mb-3">
                  {formatFileSize(file.filesize)} • {new Date(file.upload_date).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => downloadFile(file)}
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>

                  <Button
                    onClick={() => togglePublic(file.id, file.is_public)}
                    size="sm"
                    className={`${
                      file.is_public
                        ? "bg-green-500/20 hover:bg-green-500/30 text-green-100 border-green-300/30"
                        : "bg-white/20 hover:bg-white/30 text-white border-white/30"
                    }`}
                  >
                    {file.is_public ? (
                      <>
                        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Public
                      </>
                    ) : (
                      <>
                        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Private
                      </>
                    )}
                  </Button>

                  {file.is_public && file.public_link && (
                    <Button
                      onClick={() => copyPublicLink(file.public_link!)}
                      size="sm"
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 border-blue-300/30"
                    >
                      <Share2 className="h-3 w-3 mr-1" />
                      Copy Link
                    </Button>
                  )}

                  <Button onClick={() => deleteFile(file.id)} size="sm" variant="destructive" className="px-2">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
