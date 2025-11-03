import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        '@storybook/addon-essentials',
        '@storybook/addon-a11y',
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    docs: {
        autodocs: 'tag',
    },
    viteFinal: async (config) => {
        return {
            ...config,
            resolve: {
                ...config.resolve,
                alias: {
                    ...config.resolve?.alias,
                    '@': path.resolve(__dirname, '../src'),
                },
            },
        };
    },
};

export default config;
