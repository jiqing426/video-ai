"use client"

import { useParams } from "next/navigation"
import { VideoPlayer } from "@/components/video-player"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SharedVideoPage() {
  const params = useParams()
  const videoUrl = decodeURIComponent(params.id as string)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">AI生成的视频</CardTitle>
          </CardHeader>
          <CardContent>
            <VideoPlayer videoUrl={videoUrl} />
            <div className="mt-6 text-center">
              <p className="text-gray-600">这个视频是使用VideoGen AI平台生成的</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
