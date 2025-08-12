// Database configuration utility
export interface DatabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
  isLocal: boolean
  environment: 'development' | 'production' | 'testing'
}

export function getDatabaseConfig(): DatabaseConfig {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase environment variables')
  }

  // Check if we're using local Supabase
  const isLocal = supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost')
  
  // Determine environment
  let environment: 'development' | 'production' | 'testing' = 'production'
  if (isLocal) {
    environment = 'development'
  } else if (import.meta.env.MODE === 'development') {
    environment = 'development'
  } else if (import.meta.env.MODE === 'test') {
    environment = 'testing'
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceRoleKey: supabaseServiceRoleKey,
    isLocal,
    environment
  }
}

export function validateDatabaseConfig(config: DatabaseConfig): void {
  // Validate URL format
  try {
    new URL(config.url)
  } catch {
    throw new Error('Invalid Supabase URL format')
  }

  // Validate anon key format (should be a JWT)
  if (!config.anonKey.includes('.')) {
    throw new Error('Invalid Supabase anon key format')
  }

  // Local environment specific validations
  if (config.isLocal) {
    if (!config.url.includes('54321')) {
      console.warn('Warning: Local Supabase URL should typically use port 54321')
    }
    
    if (config.anonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0') {
      console.warn('Warning: Unexpected local Supabase anon key')
    }
  }

  // Production environment specific validations
  if (!config.isLocal && config.environment === 'production') {
    if (config.url.includes('localhost') || config.url.includes('127.0.0.1')) {
      throw new Error('Production environment should not use localhost URLs')
    }
    
    if (!config.url.includes('supabase.co')) {
      console.warn('Warning: Production URL should typically use supabase.co domain')
    }
  }
}

// Environment detection utilities
export function getEnvironmentInfo() {
  const config = getDatabaseConfig()
  
  return {
    environment: config.environment,
    isLocal: config.isLocal,
    isDevelopment: config.environment === 'development',
    isProduction: config.environment === 'production',
    databaseUrl: config.url,
    timestamp: new Date().toISOString()
  }
}

// Connection test utility
export async function testDatabaseConnection(): Promise<{
  success: boolean
  config: DatabaseConfig
  error?: string
  responseTime?: number
}> {
  const config = getDatabaseConfig()
  
  try {
    validateDatabaseConfig(config)
    
    const startTime = Date.now()
    const response = await fetch(`${config.url}/rest/v1/`, {
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`
      }
    })
    const responseTime = Date.now() - startTime
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return {
      success: true,
      config,
      responseTime
    }
  } catch (error) {
    return {
      success: false,
      config,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}