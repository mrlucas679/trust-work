import { useState, useEffect, useRef } from 'react';
import { Command, CommandInput, CommandList, CommandItem } from './command';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

interface SearchSuggestion {
    type: 'company' | 'skill' | 'job';
    text: string;
    value: string;
}

export const EnhancedSearchBar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const commandRef = useRef<HTMLDivElement>(null);

    // Mock suggestions - replace with API call
    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        // Simulate API call
        const mockSuggestions: SearchSuggestion[] = [
            { type: 'company', text: 'TrustWork Technologies', value: 'trustwork' },
            { type: 'skill', text: 'React Development', value: 'react' },
            { type: 'job', text: 'Senior Frontend Developer', value: 'frontend-dev' },
        ].filter(s =>
            s.text.toLowerCase().includes(query.toLowerCase())
        );

        setSuggestions(mockSuggestions);
    }, [query]);

    const handleSelect = (suggestion: SearchSuggestion) => {
        switch (suggestion.type) {
            case 'company':
                navigate(`/jobs?company=${encodeURIComponent(suggestion.value)}`);
                break;
            case 'skill':
                navigate(`/jobs?skill=${encodeURIComponent(suggestion.value)}`);
                break;
            case 'job':
                navigate(`/jobs?q=${encodeURIComponent(suggestion.text)}`);
                break;
        }
        setIsOpen(false);
    };

    return (
        <Command ref={commandRef} className="relative">
            <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <CommandInput
                    placeholder="Search jobs, skills, companies..."
                    className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    value={query}
                    onValueChange={setQuery}
                />
            </div>
            {isOpen && suggestions.length > 0 && (
                <CommandList className="absolute top-full left-0 right-0 z-50 mt-2 rounded-md border bg-popover shadow-md">
                    {suggestions.map((suggestion, index) => (
                        <CommandItem
                            key={index}
                            onSelect={() => handleSelect(suggestion)}
                            className="flex items-center px-2 py-1.5 text-sm"
                        >
                            <span className="mr-2 text-xs text-muted-foreground">
                                {suggestion.type}:
                            </span>
                            {suggestion.text}
                        </CommandItem>
                    ))}
                </CommandList>
            )}
        </Command>
    );
};
