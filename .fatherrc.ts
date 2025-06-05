import { defineConfig } from 'father';

export default defineConfig({
    platform: 'browser',
    // sourcemap: true,
    esm: {
        input: 'src/components',
        output: 'dist/es',
    },
    cjs: {
        input: 'src/components',
        output: 'dist/cjs',
    },
    extraBabelPlugins: [
        [
            'babel-plugin-import',
            {
                libraryName: 'common-component-lib',
                libraryDirectory: 'es',
                style: true,
                camel2DashComponentName: false,
            },
            'common-component-lib',
        ],
    ],
});
