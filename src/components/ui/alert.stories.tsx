import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { Terminal, AlertCircle, CheckCircle2 } from 'lucide-react';

const meta = {
    title: 'UI/Alert',
    component: Alert,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'destructive'],
        },
    },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Alert className="w-[400px]">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
                You can add components to your app using the cli.
            </AlertDescription>
        </Alert>
    ),
};

export const Destructive: Story = {
    render: () => (
        <Alert variant="destructive" className="w-[400px]">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                Your session has expired. Please log in again.
            </AlertDescription>
        </Alert>
    ),
};

export const Success: Story = {
    render: () => (
        <Alert className="w-[400px] border-green-500 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
                Your profile has been updated successfully.
            </AlertDescription>
        </Alert>
    ),
};

export const Simple: Story = {
    render: () => (
        <Alert className="w-[400px]">
            <AlertDescription>
                A simple alert with just a description.
            </AlertDescription>
        </Alert>
    ),
};
