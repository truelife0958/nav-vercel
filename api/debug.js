// Debug endpoint to check environment variables
export default function handler(req, res) {
  const hasPostgresUrl = !!process.env.POSTGRES_URL;
  const postgresUrlPrefix = process.env.POSTGRES_URL 
    ? process.env.POSTGRES_URL.substring(0, 50) + '...' 
    : 'NOT SET';
  
  res.json({
    hasPostgresUrl,
    postgresUrlPrefix,
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('POSTGRES') || key.includes('DATABASE') || key.includes('JWT') || key.includes('ADMIN')
    ),
    nodeEnv: process.env.NODE_ENV
  });
}