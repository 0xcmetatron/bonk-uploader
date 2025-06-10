"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Upload, ImageIcon, X, Globe, Lock, Copy } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

interface FileUploadProps {
  user: { publicKey: string; nickname: string }
  onUploadComplete?: () => void
}

interface FileWithSettings {
  file: File
  id: string
  isPublic: boolean
}

export function FileUpload({ user, onUploadComplete }: FileUploadProps) {
  const [files, setFiles] = useState<FileWithSettings[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [defaultPublic, setDefaultPublic] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const imageFiles = acceptedFiles.filter((file) => file.type.startsWith("image/"))
      const filesWithSettings: FileWithSettings[] = imageFiles.map((file) => ({
        file: file,
        id: Math.random().toString(36).substr(2, 9),
        isPublic: defaultPublic,
      }))
      setFiles((prev) => [...prev, ...filesWithSettings])
    },
    [defaultPublic],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    multiple: true,
  })

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const toggleFilePublic = (id: string) => {
    setFiles((prev) =>
      prev.map((fileItem) => (fileItem.id === id ? { ...fileItem, isPublic: !fileItem.isPublic } : fileItem)),
    )
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "✅ Copied!",
        description: "Link copied to clipboard",
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: text,
        duration: 5000,
      })
    }
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadedFiles = []
      const publicLinks = []

      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i]
        const file = fileItem.file
        const base64 = await convertToBase64(file)

        console.log("Uploading file:", {
          filename: file.name,
          filesize: file.size,
          filetype: file.type,
          isPublic: fileItem.isPublic,
          userPublicKey: user.publicKey,
        })

        const response = await fetch("/api/files/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            filesize: file.size,
            filetype: file.type,
            base64data: base64.split(",")[1],
            userPublicKey: user.publicKey,
            isPublic: fileItem.isPublic, // Explicitly send boolean
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
        }

        const result = await response.json()
        console.log("Upload result:", result)

        if (!result.success) {
          throw new Error(result.error)
        }

        uploadedFiles.push({
          name: file.name,
          isPublic: fileItem.isPublic,
          publicLink: result.publicLink,
        })

        if (fileItem.isPublic && result.publicLink) {
          const fullLink = `${window.location.origin}/share/${result.publicLink}`
          publicLinks.push({
            name: file.name,
            link: fullLink,
          })
        }

        setUploadProgress(((i + 1) / files.length) * 100)
      }

      // Success notification
      const publicCount = uploadedFiles.filter((f) => f.isPublic).length
      const privateCount = uploadedFiles.filter((f) => !f.isPublic).length

      let description = `${files.length} file(s) uploaded successfully!`
      if (publicCount > 0 && privateCount > 0) {
        description += ` (${publicCount} public, ${privateCount} private)`
      } else if (publicCount > 0) {
        description += ` All ${publicCount} files are public and ready to share!`
      } else {
        description += ` All ${privateCount} files are private.`
      }

      toast({
        title: "🎉 Upload Successful!",
        description,
        duration: 6000,
      })

      // Show public links immediately
      if (publicLinks.length > 0) {
        publicLinks.forEach((link, index) => {
          setTimeout(() => {
            toast({
              title: `🔗 ${link.name}`,
              description: (
                <div className="flex items-center space-x-2">
                  <span className="flex-1 text-xs break-all">{link.link}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(link.link)}
                    className="flex-shrink-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ),
              duration: 15000,
            })
          }, index * 500)
        })
      }

      setFiles([])

      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "❌ Upload Failed",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
        duration: 8000,
      })
    }

    setUploading(false)
    setUploadProgress(0)
  }

  return (
    <Card className="bg-white/20 border-orange-300/30 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Upload Images</h3>
          <div className="flex items-center space-x-3">
            <span className="text-white text-sm">Default to public:</span>
            <Switch
              checked={defaultPublic}
              onCheckedChange={setDefaultPublic}
              className="data-[state=checked]:bg-green-500"
            />
            {defaultPublic ? <Globe className="h-5 w-5 text-green-400" /> : <Lock className="h-5 w-5 text-gray-400" />}
          </div>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive ? "border-white bg-white/20" : "border-orange-300/50 hover:border-white hover:bg-white/10"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-white mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-white text-lg">Drop the images here...</p>
          ) : (
            <div>
              <p className="text-white text-lg mb-2">Drag & drop images here, or click to select</p>
              <p className="text-orange-100">Supports PNG, JPG, JPEG, GIF, WebP</p>
              <p className="text-orange-200 text-sm mt-2">
                Files will be {defaultPublic ? "🌐 PUBLIC" : "🔒 PRIVATE"} by default
              </p>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h4 className="text-white font-semibold mb-4">Selected Files ({files.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {files.map((fileItem) => (
                <div key={fileItem.id} className="relative bg-white/20 rounded-lg p-4">
                  <div className="flex space-x-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={URL.createObjectURL(fileItem.file) || "/placeholder.svg"}
                        alt={fileItem.file.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate mb-2">{fileItem.file.name}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={fileItem.isPublic}
                            onCheckedChange={() => toggleFilePublic(fileItem.id)}
                            className="data-[state=checked]:bg-green-500"
                          />
                          <span className="text-sm text-white">
                            {fileItem.isPublic ? (
                              <div className="flex items-center space-x-1 text-green-400">
                                <Globe className="h-4 w-4" />
                                <span className="font-bold">PUBLIC</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 text-gray-400">
                                <Lock className="h-4 w-4" />
                                <span>Private</span>
                              </div>
                            )}
                          </span>
                        </div>
                        <Button
                          onClick={() => removeFile(fileItem.id)}
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {fileItem.isPublic && (
                        <p className="text-xs text-green-300 mt-1 font-medium">✅ Will generate public download link</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {uploading && (
              <div className="mb-4">
                <Progress value={uploadProgress} className="mb-2" />
                <p className="text-white text-center">{Math.round(uploadProgress)}% uploaded</p>
              </div>
            )}

            <Button
              onClick={uploadFiles}
              disabled={uploading}
              className="w-full bg-white text-orange-500 hover:bg-orange-50 font-semibold"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : `Upload ${files.length} Image(s)`}
            </Button>

            <div className="mt-4 text-center">
              <p className="text-orange-100 text-sm">
                🌐 Public: {files.filter((f) => f.isPublic).length} • 🔒 Private:{" "}
                {files.filter((f) => !f.isPublic).length}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
