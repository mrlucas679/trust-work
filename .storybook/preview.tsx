import type { Preview } from '@storybook/react';
import '../src/index.css';
import { ThemeProvider } from '../src/providers/ThemeProvider';
import React from 'react';

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
        backgrounds: {
            default: 'light',
            values: [
                { name: 'light', value: '#ffffff' },
                { name: 'dark', value: '#0f172a' },
            ],
        },
    },
    decorators: [
        (Story) => (
            <ThemeProvider>
                <div className="p-4">
                    <Story />
                </div>
            </ThemeProvider>
        ),
    ],
};

export default preview;
