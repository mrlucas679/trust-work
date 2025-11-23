import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Label } from './label';

const meta = {
    title: 'UI/Input',
    component: Input,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        type: {
            control: 'select',
            options: ['text', 'email', 'password', 'number', 'tel', 'url'],
        },
        placeholder: {
            control: 'text',
        },
        disabled: {
            control: 'boolean',
        },
    },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        placeholder: 'Enter text...',
    },
};

export const WithLabel: Story = {
    render: () => (
        <div className="w-[350px] space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="email@example.com" />
        </div>
    ),
};

export const Password: Story = {
    render: () => (
        <div className="w-[350px] space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter password" />
        </div>
    ),
};

export const Disabled: Story = {
    args: {
        placeholder: 'Disabled input',
        disabled: true,
    },
};

export const WithError: Story = {
    render: () => (
        <div className="w-[350px] space-y-2">
            <Label htmlFor="email-error">Email</Label>
            <Input
                id="email-error"
                type="email"
                placeholder="email@example.com"
                aria-invalid="true"
                aria-describedby="email-error-message"
                className="border-destructive"
            />
            <p id="email-error-message" className="text-sm text-destructive">
                Please enter a valid email address
            </p>
        </div>
    ),
};

export const Number: Story = {
    render: () => (
        <div className="w-[350px] space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" placeholder="25" />
        </div>
    ),
};
