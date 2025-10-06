module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'ready',
      startServerReadyTimeout: 60000,
      url: [
        'http://localhost:3000',
        'http://localhost:3000/firma',
        'http://localhost:3000/program-hakkinda',
        'http://localhost:3000/kariyer',
        'http://localhost:3000/giris',
      ],
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        skipAudits: ['uses-http2'],
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.6 }],
        'categories:accessibility': ['warn', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.7 }],
        'categories:seo': ['warn', { minScore: 0.7 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.2 }],
        'speed-index': ['warn', { maxNumericValue: 4000 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './performance-results/lighthouse',
    },
  },
};
