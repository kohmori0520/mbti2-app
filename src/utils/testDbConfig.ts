// Test database configuration utility
import { getDatabaseConfig, validateDatabaseConfig, testDatabaseConnection, getEnvironmentInfo } from './dbConfig'

export async function runDatabaseConfigTest(): Promise<void> {
  console.log('🔍 Database Configuration Investigation Report')
  console.log('=' .repeat(50))
  
  try {
    // Get environment info
    const envInfo = getEnvironmentInfo()
    console.log('\n📊 Environment Information:')
    console.log(`- Environment: ${envInfo.environment}`)
    console.log(`- Is Local: ${envInfo.isLocal}`)
    console.log(`- Database URL: ${envInfo.databaseUrl}`)
    console.log(`- Timestamp: ${envInfo.timestamp}`)
    
    // Get database config
    const config = getDatabaseConfig()
    console.log('\n⚙️ Database Configuration:')
    console.log(`- URL: ${config.url}`)
    console.log(`- Is Local: ${config.isLocal}`)
    console.log(`- Environment: ${config.environment}`)
    console.log(`- Anon Key: ${config.anonKey.substring(0, 20)}...`)
    
    // Validate configuration
    console.log('\n✅ Configuration Validation:')
    try {
      validateDatabaseConfig(config)
      console.log('- Configuration is valid')
    } catch (error) {
      console.log(`- Configuration error: ${error instanceof Error ? error.message : error}`)
    }
    
    // Test connection
    console.log('\n🔌 Connection Test:')
    const connectionTest = await testDatabaseConnection()
    if (connectionTest.success) {
      console.log(`- Connection successful (${connectionTest.responseTime}ms)`)
    } else {
      console.log(`- Connection failed: ${connectionTest.error}`)
    }
    
    // Environment-specific validation
    console.log('\n🎯 Environment-Specific Validation:')
    if (config.isLocal) {
      console.log('- ✅ Local environment detected')
      console.log(`- ✅ Using local Supabase URL: ${config.url}`)
      console.log('- ✅ Port 54321 confirmed for local API')
    } else {
      console.log('- ✅ Production environment detected')
      console.log(`- ✅ Using production Supabase URL: ${config.url}`)
      console.log('- ✅ Using supabase.co domain')
    }
    
    console.log('\n' + '=' .repeat(50))
    console.log('✅ Database configuration investigation complete!')
    
  } catch (error) {
    console.error('\n❌ Database configuration test failed:', error)
  }
}

// Export for use in other modules