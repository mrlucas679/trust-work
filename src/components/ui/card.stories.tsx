import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';

const meta = {
    title: 'UI/Card',
    component: Card,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        className: {
            control: 'text',
            description: 'Additional CSS classes',
        },
    },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
                <p>This is the card content area where you can place any content.</p>
            </CardContent>
        </Card>
    ),
};

export const WithFooter: Story = {
    render: () => (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Confirm Action</CardTitle>
                <CardDescription>Are you sure you want to proceed?</CardDescription>
            </CardHeader>
            <CardContent>
                <p>This action cannot be undone. Please review before confirming.</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Confirm</Button>
            </CardFooter>
        </Card>
    ),
};

export const Simple: Story = {
    render: () => (
        <Card className="w-[350px]">
            <CardContent className="pt-6">
                <p>A simple card with just content.</p>
            </CardContent>
        </Card>
    ),
};

export const Profile: Story = {
    render: () => (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1">
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">John Doe</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">john@example.com</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-sm text-muted-foreground">Administrator</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full">Edit Profile</Button>
            </CardFooter>
        </Card>
    ),
};
