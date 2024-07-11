import swaggerJsDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SecretShare API',
            version: '1.0.0',
            description: 'API for SecretShare',
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:5000',
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // Path to the API docs
};

const specs = swaggerJsDoc(options);

export default specs;
