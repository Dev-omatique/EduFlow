import dotenv from 'dotenv'
dotenv.config()
const config =  {
  development: {
    dialect: 'postgres',
    url : process.env.DATABASE_URL
  }
}
export default config;