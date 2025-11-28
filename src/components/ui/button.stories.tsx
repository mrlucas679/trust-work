import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Mail, Plus, Loader2 } from 'lucide-react';

const meta = {
    title: 'UI/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
            description: 'The visual style variant of the button',
        },
        size: {
            control: 'select',
            options: ['default', 'sm', 'lg', 'icon'],
            description: 'The size of the button',
        },
        disabled: {
            control: 'boolean',
            description: 'Whether the button is disabled',
        },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Primary: Story = {
    args: {
        children: 'Button',
        variant: 'default',
    },
};

export const Secondary: Story = {
    args: {
        children: 'Button',
        variant: 'secondary',
    },
};

export const Destructive: Story = {
    args: {
        children: 'Delete',
        variant: 'destructive',
    },
};

export const Outline: Story = {
    args: {
        children: 'Button',
        variant: 'outline',
    },
};

export const Ghost: Story = {
    args: {
        children: 'Button',
        variant: 'ghost',
    },
};

export const Link: Story = {
    args: {
        children: 'Link Button',
        variant: 'link',
    },
};

// Size variants
export const Small: Story = {
    args: {
        children: 'Small Button',
        size: 'sm',
    },
};

export const Large: Story = {
    args: {
        children: 'Large Button',
        size: 'lg',
    },
};

export const Icon: Story = {
    args: {
        size: 'icon',
        children: <Plus className="h-4 w-4" />,
    },
};

// States
export const Disabled: Story = {
    args: {
        children: 'Disabled Button',
        disabled: true,
    },
};

export const Loading: Story = {
    args: {
        children: (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
            </>
        ),
        disabled: true,
    },
};

// With icons
export const WithIcon: Story = {
    args: {
        children: (
            <>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
            </>
        ),
    },
};

// Full width
export const FullWidth: Story = {
    args: {
        children: 'Full Width Button',
        className: 'w-full',
    },
    parameters: {
        layout: 'padded',
    },
};
