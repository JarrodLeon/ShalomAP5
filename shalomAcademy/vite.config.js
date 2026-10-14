import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import jsconfigPaths from 'vite-jsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), jsconfigPaths(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
