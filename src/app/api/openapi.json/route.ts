/**
 * OpenAPI Specification Endpoint
 * Generates OpenAPI/Swagger specification from JSDoc comments
 */

import { NextResponse } from 'next/server';
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Akademi Port API',
      version: '1.0.0',
      description: 'E-İhracat Dönüşüm Platformu API Dokümantasyonu',
      contact: {
        name: 'API Support',
        email: 'support@akademiport.com',
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.akademiport.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'sb-access-token',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
        cookieAuth: [],
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Programs', description: 'Program management endpoints' },
      { name: 'Companies', description: 'Company management endpoints' },
      { name: 'Projects', description: 'Project management endpoints' },
      { name: 'Tasks', description: 'Task management endpoints' },
      { name: 'Consultant', description: 'Consultant-specific endpoints' },
      { name: 'Training', description: 'Training management endpoints' },
    ],
  },
  apis: [
    './src/app/api/**/*.ts', // Path to API files
  ],
};

export async function GET() {
  try {
    const spec = swaggerJsdoc(options);
    return NextResponse.json(spec);
  } catch (error) {
    console.error('Error generating OpenAPI spec:', error);
    return NextResponse.json({ error: 'Failed to generate API documentation' }, { status: 500 });
  }
}
