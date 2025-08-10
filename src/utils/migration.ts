import { DatabaseService } from '../services/database'

type LocalStorageAnswerLog = {
  ts: number
  id: number
  axis: string
  version?: number
  weight?: number
  pick: 'A' | 'B'
}

type LocalStorageResultLog = {
  ts: number
  primary: string
  secondary: string
  conf: number
}

export class MigrationService {
  static async migrateLocalStorageToSupabase(): Promise<{
    success: boolean
    sessionsCreated: number
    answersMigrated: number
    resultsMigrated: number
    errors: string[]
  }> {
    const errors: string[] = []
    let sessionsCreated = 0
    let answersMigrated = 0
    let resultsMigrated = 0

    try {
      // LocalStorageからデータを取得
      const answerLogs = this.getLocalAnswerLogs()
      const resultLogs = this.getLocalResultLogs()

      if (answerLogs.length === 0 && resultLogs.length === 0) {
        return {
          success: true,
          sessionsCreated: 0,
          answersMigrated: 0,
          resultsMigrated: 0,
          errors: ['No data to migrate']
        }
      }

      // セッション作成（簡易的に一つのセッションにまとめる）
      const sessionId = await DatabaseService.createSession(navigator.userAgent)
      sessionsCreated = 1

      // 回答データの移行
      for (const log of answerLogs) {
        try {
          await DatabaseService.saveAnswer(
            sessionId,
            log.id,
            log.pick,
            log.axis,
            log.weight || 1.0,
            log.version || 1
          )
          answersMigrated++
        } catch (error) {
          errors.push(`Failed to migrate answer ${log.id}: ${error}`)
        }
      }

      // 結果データの移行
      for (const log of resultLogs) {
        try {
          await DatabaseService.saveResult(
            sessionId,
            log.primary,
            log.secondary,
            log.conf,
            {} // axesScoresは現在LocalStorageにないので空オブジェクト
          )
          resultsMigrated++
        } catch (error) {
          errors.push(`Failed to migrate result: ${error}`)
        }
      }

      // セッション完了
      if (resultLogs.length > 0) {
        await DatabaseService.completeSession(sessionId)
      }

      return {
        success: errors.length === 0,
        sessionsCreated,
        answersMigrated,
        resultsMigrated,
        errors
      }
    } catch (error) {
      errors.push(`Migration failed: ${error}`)
      return {
        success: false,
        sessionsCreated,
        answersMigrated,
        resultsMigrated,
        errors
      }
    }
  }

  static getLocalAnswerLogs(): LocalStorageAnswerLog[] {
    try {
      const data = localStorage.getItem('answerLogs')
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  static getLocalResultLogs(): LocalStorageResultLog[] {
    try {
      const data = localStorage.getItem('resultLogs')
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  static clearLocalStorage(): void {
    localStorage.removeItem('answers')
    localStorage.removeItem('answerLogs')
    localStorage.removeItem('resultLogs')
  }

  static async checkMigrationNeeded(): Promise<boolean> {
    const answerLogs = this.getLocalAnswerLogs()
    const resultLogs = this.getLocalResultLogs()
    return answerLogs.length > 0 || resultLogs.length > 0
  }
}