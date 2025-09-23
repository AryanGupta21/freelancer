// tailwind.config.ts

import type { Config } from 'tailwindcss'

const config: Config = {
  // Add the path to your UI components here
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}', // This includes components/ui
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Your theme extensions...
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
export default config