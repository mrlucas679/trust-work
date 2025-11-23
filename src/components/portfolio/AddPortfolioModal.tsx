import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface AddPortfolioModalProps {
    children: React.ReactNode;
}

export function AddPortfolioModal({ children }: AddPortfolioModalProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [client, setClient] = useState('');
    const [description, setDescription] = useState('');
    const [completedDate, setCompletedDate] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');
    const { toast } = useToast();

    const handleAddSkill = () => {
        if (skillInput.trim() && !skills.includes(skillInput.trim())) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!title.trim() || !client.trim() || !description.trim() || !completedDate) {
            toast({
                title: 'Missing Information',
                description: 'Please fill in all required fields.',
                variant: 'destructive',
            });
            return;
        }

        // Here you would typically save to database
        toast({
            title: 'Portfolio Item Added',
            description: 'Your project has been added to your portfolio.',
        });

        // Reset form and close modal
        setTitle('');
        setClient('');
        setDescription('');
        setCompletedDate('');
        setSkills([]);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Portfolio Project</DialogTitle>
                    <DialogDescription>
                        Showcase your best work by adding a new project to your portfolio.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Project Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Project Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="title"
                            placeholder="e.g., E-commerce Website Redesign"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Client Name */}
                    <div className="space-y-2">
                        <Label htmlFor="client">
                            Client Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="client"
                            placeholder="e.g., ABC Company"
                            value={client}
                            onChange={(e) => setClient(e.target.value)}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Project Description <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Describe what you did, the challenges you faced, and the results achieved..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            required
                        />
                    </div>

                    {/* Completion Date */}
                    <div className="space-y-2">
                        <Label htmlFor="completedDate">
                            Completion Date <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="completedDate"
                            type="date"
                            value={completedDate}
                            onChange={(e) => setCompletedDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Skills Used */}
                    <div className="space-y-2">
                        <Label htmlFor="skills">Skills Used</Label>
                        <div className="flex gap-2">
                            <Input
                                id="skills"
                                placeholder="e.g., React, TypeScript"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddSkill();
                                    }
                                }}
                            />
                            <Button type="button" variant="secondary" onClick={handleAddSkill}>
                                Add
                            </Button>
                        </div>
                        {skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {skills.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="gap-1">
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Add to Portfolio
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
