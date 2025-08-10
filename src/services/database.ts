import { supabase, type Database } from '../lib/supabase'

type Session = Database['public']['Tables']['sessions']['Row']
type Answer = Database['public']['Tables']['answers']['Row']
type Result = Database['public']['Tables']['results']['Row']

export class DatabaseService {
  // セッション管理
  static async createSession(userAgent?: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({ user_agent: userAgent })
        .select('id')
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Database createSession failed:', error)
      throw new Error(`Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async completeSession(sessionId: string, completedMs?: number): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .update({
        completed_at: new Date().toISOString(),
        ...(typeof completedMs === 'number' ? { completed_ms: completedMs } : {})
      })
      .eq('id', sessionId)

    if (error) throw error
  }

  // 回答データ管理
  static async saveAnswer(
    sessionId: string,
    questionId: number,
    answer: 'A' | 'B',
    axis: string,
    weight: number = 1.0,
    version: number = 1,
    latencyMs?: number
  ): Promise<void> {
    const { error } = await supabase
      .from('answers')
      .insert({
        session_id: sessionId,
        question_id: questionId,
        answer,
        axis,
        weight,
        version,
        ...(typeof latencyMs === 'number' ? { latency_ms: latencyMs } : {})
      })

    if (error) throw error
  }

  static async getSessionAnswers(sessionId: string): Promise<Answer[]> {
    const { data, error } = await supabase
      .from('answers')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true })

    if (error) throw error
    return data || []
  }

  // 結果データ管理
  static async saveResult(
    sessionId: string,
    primaryType: string,
    secondaryType: string,
    confidence: number,
    axesScores: Record<string, number>
  ): Promise<void> {
    const { error } = await supabase
      .from('results')
      .insert({
        session_id: sessionId,
        primary_type: primaryType,
        secondary_type: secondaryType,
        confidence,
        axes_scores: axesScores
      })

    if (error) throw error
  }

  // 分析用データ取得
  static async getTypeDistribution(): Promise<{ type: string; count: number }[]> {
    const { data, error } = await supabase
      .from('results')
      .select('primary_type')
      .order('primary_type')

    if (error) throw error

    // タイプ別集計
    const distribution = data.reduce((acc, result) => {
      acc[result.primary_type] = (acc[result.primary_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(distribution).map(([type, count]) => ({ type, count }))
  }

  static async getAnswerTrends(axis?: string): Promise<any[]> {
    let query = supabase
      .from('answers')
      .select('axis, answer, timestamp')

    if (axis) {
      query = query.eq('axis', axis)
    }

    const { data, error } = await query.order('timestamp', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getRecentResults(limit: number = 100): Promise<Result[]> {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  // 統計情報
  static async getStats(): Promise<{
    totalSessions: number
    completedSessions: number
    totalAnswers: number
    mostCommonType: string
  }> {
    const [sessionsResult, answersResult, resultsResult] = await Promise.all([
      supabase.from('sessions').select('*', { count: 'exact', head: true }),
      supabase.from('answers').select('*', { count: 'exact', head: true }),
      supabase.from('results').select('primary_type')
    ])

    if (sessionsResult.error || answersResult.error || resultsResult.error) {
      throw new Error('Failed to fetch stats')
    }

    const typeDistribution = await this.getTypeDistribution()
    const mostCommonType = typeDistribution.sort((a, b) => b.count - a.count)[0]?.type || 'N/A'

    return {
      totalSessions: sessionsResult.count || 0,
      completedSessions: resultsResult.data?.length || 0,
      totalAnswers: answersResult.count || 0,
      mostCommonType
    }
  }
}