import { createClient } from '@/lib/supabase/client'
import { GenerationHistory, CreateGenerationHistoryInput } from '@/types/generation-history'

export async function createGenerationHistory(input: CreateGenerationHistoryInput): Promise<GenerationHistory> {
  const supabase = createClient()
  
  try {
    // 获取当前用户会话
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('获取会话失败:', sessionError)
      throw new Error('Failed to get user session')
    }

    if (!session?.user) {
      console.error('用户未登录')
      throw new Error('User not authenticated')
    }

    // 添加用户ID到输入数据
    const dataWithUserId = {
      ...input,
      user_id: session.user.id
    }

    const { data, error } = await supabase
      .from('generation_history')
      .insert([dataWithUserId])
      .select()
      .single()

    if (error) {
      console.error('创建生成历史失败:', error)
      throw new Error(`Failed to create generation history: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('创建生成历史时发生错误:', error)
    throw error
  }
}

export async function getGenerationHistory(): Promise<GenerationHistory[]> {
  const supabase = createClient()
  
  try {
    // 获取当前用户会话
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('获取会话失败:', sessionError)
      return []
    }

    if (!session?.user) {
      console.log('用户未登录')
      return []
    }
    // 获取生成历史记录
    const { data, error } = await supabase
      .from('generation_history')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取生成历史失败:', error)
      throw new Error(`Failed to fetch generation history: ${error.message}`)
    }

    console.log('查询结果:', {
      data,
      error,
      count: data?.length,
      user_id: session.user.id
    })
    return data || []
  } catch (error) {
    console.error('获取生成历史时发生错误:', error)
    return []
  }
}

export async function getGenerationHistoryById(id: string): Promise<GenerationHistory> {
  const supabase = createClient()
  
  try {
    // 获取当前用户会话
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('获取会话失败:', sessionError)
      throw new Error('Failed to get user session')
    }

    if (!session?.user) {
      console.error('用户未登录')
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('generation_history')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (error) {
      console.error('获取生成历史失败:', error)
      throw new Error(`Failed to fetch generation history: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('获取生成历史时发生错误:', error)
    throw error
  }
}

export async function updateGenerationHistoryStatus(
  id: string,
  status: 'completed' | 'processing' | 'failed'
): Promise<GenerationHistory> {
  const supabase = createClient()
  
  try {
    // 获取当前用户会话
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('获取会话失败:', sessionError)
      throw new Error('Failed to get user session')
    }

    if (!session?.user) {
      console.error('用户未登录')
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('generation_history')
      .update({ status })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('更新生成历史失败:', error)
      throw new Error(`Failed to update generation history: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('更新生成历史时发生错误:', error)
    throw error
  }
}

export async function deleteGenerationHistory(id: string): Promise<void> {
  const supabase = createClient()
  
  try {
    console.log('准备删除记录:', { id })
    
    const { error, data } = await supabase
      .from('generation_history')
      .delete()
      .eq('id', id)
      .eq('user_id', 'a3364bff-a134-4638-b1e4-8b229f8af38a')
      .select()

    console.log('删除结果:', { error, data })

    if (error) {
      console.error('删除生成历史失败:', error)
      throw new Error(`Failed to delete generation history: ${error.message}`)
    }
  } catch (error) {
    console.error('删除生成历史时发生错误:', error)
    throw error
  }
} 