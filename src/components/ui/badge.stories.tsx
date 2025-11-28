import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

const meta = {
    title: 'UI/Badge',
    component: Badge,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'secondary', 'destructive', 'outline'],
        },
    },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: 'Badge',
        variant: 'default',
    },
};

export const Secondary: Story = {
    args: {
        children: 'Secondary',
        variant: 'secondary',
    },
};

export const Destructive: Story = {
    args: {
        children: 'Destructive',
        variant: 'destructive',
    },
};

export const Outline: Story = {
    args: {
        children: 'Outline',
        variant: 'outline',
    },
};

export const StatusIndicators: Story = {
    render: () => (
        <div className="flex flex-wrap gap-2">
            <Badge>Active</Badge>
            <Badge variant="secondary">Pending</Badge>
            <Badge variant="destructive">Rejected</Badge>
            <Badge variant="outline">Draft</Badge>
        </div>
    ),
};

export const CustomColors: Story = {
    render: () => (
        <div className="flex flex-wrap gap-2">
            <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>
            <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>
            <Badge className="bg-blue-500 hover:bg-blue-600">Info</Badge>
            <Badge className="bg-purple-500 hover:bg-purple-600">Premium</Badge>
        </div>
    ),
};
