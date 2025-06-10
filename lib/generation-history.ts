import { createClient } from '@/lib/supabase/client'
import { GenerationHistory, CreateGenerationHistoryInput } from '@/types/generation-history'

export async function createGenerationHistory(input: CreateGenerationHistoryInput): Promise<GenerationHistory> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('generation_history')
    .insert([input])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create generation history: ${error.message}`)
  }

  return data
}

export async function getGenerationHistory(): Promise<GenerationHistory[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('generation_history')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch generation history: ${error.message}`)
  }

  return data
}

export async function getGenerationHistoryById(id: string): Promise<GenerationHistory> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('generation_history')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch generation history: ${error.message}`)
  }

  return data
}

export async function updateGenerationHistoryStatus(
  id: string,
  status: 'completed' | 'processing' | 'failed'
): Promise<GenerationHistory> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('generation_history')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update generation history: ${error.message}`)
  }

  return data
}

export async function deleteGenerationHistory(id: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('generation_history')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete generation history: ${error.message}`)
  }
} 