"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, ArrowLeft, Share2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"

interface FileData {
  id: number
  filename: string
  filesize: number
  filetype: string
  base64data: string
  upload_date: string
  uploader_nickname: string
}

export default function SharePage({ params }: { params: { link: string } }) {
  const [file, setFile] = useState<FileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchFile()
  }, [params.link])

  const fetchFile = async () => {
    try {
      const response = await fetch(`/api/files/public/${params.link}`)
      const result = await response.json()

      if (result.success) {
        setFile(result.file)
      } else {
        setError(result.error || "File not found")
      }
    } catch (error) {
      setError("Failed to load file")
    }

    setLoading(false)
  }

  const downloadFile = () => {
    if (!file) return

    const link = document.createElement("a")
    link.href = `data:${file.filetype};base64,${file.base64data}`
    link.download = file.filename
    link.click()

    toast({
      title: "Download started",
      description: `Downloading ${file.filename}`,
    })
  }

  const shareFile = async () => {
    const shareUrl = window.location.href

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 flex items-center justify-center">
        <Card className="bg-white/20 border-orange-300/30 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Loading file...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 flex items-center justify-center">
        <Card className="bg-white/20 border-orange-300/30 backdrop-blur-sm max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-white mb-4">File Not Found</h2>
            <p className="text-orange-100 mb-6">{error}</p>
            <Link href="/">
              <Button className="bg-white text-orange-500 hover:bg-orange-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500">
      {/* Header */}
      <header className="border-b border-orange-300/20 backdrop-blur-sm bg-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <Image src="/logo.png" alt="BonkUpload Logo" fill className="object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">BonkUpload</h1>
            </div>
          </Link>
          <a
            href="https://x.com/bonkupload"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-black/20 hover:bg-black/30 text-white px-3 py-2 rounded-full transition-all duration-300"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-sm">@bonkupload</span>
          </a>
        </div>
      </header>

      {/* File Display */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/20 border-orange-300/30 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-2xl">Shared File</CardTitle>
              <p className="text-orange-100">Uploaded by {file.uploader_nickname}</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="relative aspect-square max-w-md mx-auto mb-4">
                  <Image
                    src={`data:${file.filetype};base64,${file.base64data}`}
                    alt={file.filename}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{file.filename}</h3>
                <div className="flex justify-center space-x-4 text-orange-100 text-sm">
                  <span>{formatFileSize(file.filesize)}</span>
                  <span>•</span>
                  <span>{new Date(file.upload_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex space-x-4 justify-center">
                <Button
                  onClick={downloadFile}
                  className="bg-white text-orange-500 hover:bg-orange-50 font-semibold px-6"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
                <Button
                  onClick={shareFile}
                  variant="outline"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </Button>
              </div>

              <div className="mt-6 text-center">
                <Link href="/">
                  <Button variant="ghost" className="text-white hover:bg-white/20">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Upload your own files
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
