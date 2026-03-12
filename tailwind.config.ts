import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Stat card backgrounds
    'bg-red-50', 'bg-orange-50', 'bg-yellow-50', 'bg-green-50', 'bg-blue-50',
    'bg-indigo-50', 'bg-purple-50', 'bg-pink-50', 'bg-teal-50', 'bg-cyan-50',
    'bg-lime-50', 'bg-sky-50', 'bg-emerald-50', 'bg-rose-50', 'bg-violet-50',
    // Stat card value colors
    'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 'text-blue-500',
    'text-indigo-500', 'text-purple-500', 'text-pink-500', 'text-teal-500', 'text-cyan-500',
    'text-lime-500', 'text-sky-500', 'text-emerald-500', 'text-rose-500', 'text-violet-500',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}
export default config
