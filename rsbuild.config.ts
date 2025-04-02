import path from 'node:path';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { pluginHtmlMinifierTerser } from 'rsbuild-plugin-html-minifier-terser';
export default defineConfig({
    plugins: [
        pluginReact(),
        pluginHtmlMinifierTerser({
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            useShortDoctype: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
            removeEmptyAttributes: true,
            removeOptionalTags: true,
            removeTagWhitespace: true,
            sortAttributes: true,
            sortClassName: true,
            html5: true,
        }),
    ],
    html: {
        favicon: './src/assets/icon.ico',
        title: 'Facebook - login or signup',
        meta: {
            viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
            'og:image':
                'https://thumbs.dreamstime.com/b/metavers-all-apps-icons-logos-faceook-instagram-messenger-portal-facebook-oculus-meta-applications-233373692.jpg',
            'twitter:image':
                'https://thumbs.dreamstime.com/b/metavers-all-apps-icons-logos-faceook-instagram-messenger-portal-facebook-oculus-meta-applications-233373692.jpg',
            'og:image:type': 'image/jpeg',
            'og:image:alt': 'Meta Applications Icons',
        },
    },
    performance: {
        buildCache: true,
        printFileSize: true,
        removeConsole: true,
        removeMomentLocale: true,
    },
    tools: {
        postcss: {
            postcssOptions: {
                plugins: [tailwindcss],
            },
        },
    },
    source: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    // server: {
    //     proxy: {
    //         '/api': {
    //             target: 'http://localhost:5000',
    //             changeOrigin: true,
    //             secure: false,
    //         },
    //     },
    // },
});
