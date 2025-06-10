import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Whisper } from "https://esm.sh/whisper-node@0.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { videoPath } = await req.json();

    // 创建 Supabase 客户端
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 获取视频文件
    const { data: videoData, error: videoError } = await supabaseClient.storage
      .from("videos")
      .download(videoPath);

    if (videoError) throw videoError;

    // 初始化 Whisper
    const whisper = new Whisper({
      apiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
    });

    // 转写视频
    const transcription = await whisper.transcribe(videoData);

    return new Response(
      JSON.stringify({ text: transcription.text }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
}); 