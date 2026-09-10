import { defineConfig } from 'vite';
export default defineConfig({root:'src/renderer',base:'./',build:{outDir:'../../dist/renderer',emptyOutDir:true,rollupOptions:{input:{main:'src/renderer/index.html',audience:'src/renderer/audience.html',stage:'src/renderer/stage.html',stream:'src/renderer/stream.html'}}}});
