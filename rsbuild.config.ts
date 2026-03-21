import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  output: {
    // 某些面板环境会在 dist 下放置 .user.ini（文件），
    // 关闭内置清理，避免清理阶段对该路径执行目录扫描时报 ENOTDIR。
    cleanDistPath: false,
  },
  source: {
    entry: {
      index: './src/entry.tsx',
    },
  },
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
    },
  },
});
      
