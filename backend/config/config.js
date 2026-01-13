import dotenv from 'dotenv'

const config =  {
  development: {
    dialect: 'postgres',
    url : process.env.DATABASE_URL
  }
}
export default config;