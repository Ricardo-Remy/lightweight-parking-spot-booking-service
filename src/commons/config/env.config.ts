import * as Joi from 'joi';

export const ConfigEnv = {
    ENV: Joi.string().optional().valid('development', 'production').default('development'),
    DATABASE_URL: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
    DATABASE_HOST: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_USERNAME: Joi.string().required(),
    DATABASE_PORT: Joi.string().required(),
    API_PORT: Joi.number().required(),
    REDIS_URL: Joi.string().required(),
};
