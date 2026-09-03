import fs from 'fs';
import swaggerJSDoc from 'swagger-jsdoc';

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: { title: 'SecretShare API', version: '1.0.0', description: 'API for SecretShare' },
  servers: [{ url: process.env.API_URL || 'http://localhost:5000', description: 'API server' }],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./src/routes/*.ts', './src/models/*.ts'], // Adjust this to your project's structure
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Write the Swagger JSON to a file
fs.writeFileSync('./swagger.json', JSON.stringify(swaggerSpec, null, 2), 'utf8');
console.log('Swagger JSON file generated successfully!');