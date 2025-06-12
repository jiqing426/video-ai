-- 添加 aspect_ratio 字段到 generation_history 表
ALTER TABLE generation_history
ADD COLUMN aspect_ratio VARCHAR(10) DEFAULT '16:9';

-- 更新现有记录的 aspect_ratio
UPDATE generation_history
SET aspect_ratio = '16:9'
WHERE aspect_ratio IS NULL; 