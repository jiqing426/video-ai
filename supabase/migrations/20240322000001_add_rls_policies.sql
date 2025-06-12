-- 启用 RLS
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许用户查看自己的记录
CREATE POLICY "Users can view their own generation history"
ON generation_history
FOR SELECT
USING (auth.uid() = user_id);

-- 创建策略：允许用户插入自己的记录
CREATE POLICY "Users can insert their own generation history"
ON generation_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 创建策略：允许用户更新自己的记录
CREATE POLICY "Users can update their own generation history"
ON generation_history
FOR UPDATE
USING (auth.uid() = user_id);

-- 创建策略：允许用户删除自己的记录
CREATE POLICY "Users can delete their own generation history"
ON generation_history
FOR DELETE
USING (auth.uid() = user_id); 