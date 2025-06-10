"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";

export function VideoTranscribe() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // 生成唯一的文件名
      const fileExt = file.name.split('.').pop();
      const fileName = `${nanoid()}.${fileExt}`;

      // 上传视频到 Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(percent);
          },
        });

      if (uploadError) throw uploadError;

      // 开始转写
      setIsTranscribing(true);
      const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke("transcribe-video", {
        body: { videoPath: uploadData.path },
      });

      if (transcribeError) throw transcribeError;

      // 保存转写结果到数据库
      const { error: saveError } = await supabase.from("transcriptions").insert({
        video_name: file.name,
        video_path: uploadData.path,
        text: transcribeData.text,
      });

      if (saveError) throw saveError;

      toast({
        title: "转写完成",
        description: "视频已成功转写",
      });

      // 刷新页面以显示新记录
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "错误",
        description: "处理视频时发生错误",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsTranscribing(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>视频转写</CardTitle>
        <CardDescription>上传视频文件并自动转写为文字</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="video-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-muted-foreground"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">点击上传</span> 或拖拽文件
                </p>
                <p className="text-xs text-muted-foreground">支持 MP4, MOV, AVI 等格式</p>
              </div>
              <input
                id="video-upload"
                type="file"
                className="hidden"
                accept="video/*"
                onChange={handleFileChange}
                disabled={isUploading || isTranscribing}
              />
            </label>
          </div>

          {(isUploading || isTranscribing) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{isUploading ? "上传中..." : "转写中..."}</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 