export const ConfigMap = () => ({
    ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    DATABASE_USERNAME: process.env.DATABASE_USERNAME,
    DATABASE_PORT: process.env.DATABASE_PORT,
    API_PORT: process.env.API_PORT,
    REDIS_URL: process.env.REDIS_URL,
    GITHUB_PROJECT_REPOSITORY_API_URL: process.env.GITHUB_PROJECT_REPOSITORY_API_URL,
});
