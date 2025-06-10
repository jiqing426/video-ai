"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

type Transcription = Database["public"]["Tables"]["transcriptions"]["Row"];

export default function HistoryPage() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  const fetchTranscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("transcriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTranscriptions(data || []);
    } catch (error) {
      console.error("Error fetching transcriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">加载中...</div>;
  }

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">转写历史</h1>
      <div className="grid gap-4">
        {transcriptions.map((transcription) => (
          <Card key={transcription.id}>
            <CardHeader>
              <CardTitle>{transcription.video_name}</CardTitle>
              <CardDescription>
                创建时间：{format(new Date(transcription.created_at), "PPP", { locale: zhCN })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{transcription.text}</p>
            </CardContent>
          </Card>
        ))}
        {transcriptions.length === 0 && (
          <div className="text-center text-muted-foreground">暂无转写记录</div>
        )}
      </div>
    </main>
  );
} 