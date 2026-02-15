import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sop-blue': '#3b82f6',
        'sop-green': '#10b981',
        'sop-purple': '#8b5cf6',
        'sop-orange': '#f59e0b',
        'sop-red': '#ef4444',
      },
    },
  },
  plugins: [],
};

export default config;
