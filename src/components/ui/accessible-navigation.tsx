import { KeyboardEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavigationItem {
    label: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    description?: string;
}

interface AccessibleNavigationProps {
    items: NavigationItem[];
}

export const AccessibleNavigation = ({ items }: AccessibleNavigationProps) => {
    const navigate = useNavigate();
    const [focusIndex, setFocusIndex] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusIndex((prev) => (prev + 1) % items.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusIndex((prev) => (prev - 1 + items.length) % items.length);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                navigate(items[focusIndex].href);
                break;
            case 'Home':
                e.preventDefault();
                setFocusIndex(0);
                break;
            case 'End':
                e.preventDefault();
                setFocusIndex(items.length - 1);
                break;
        }
    };

    return (
        <nav
            ref={menuRef}
            role="navigation"
            aria-label="Main navigation"
            onKeyDown={handleKeyDown}
        >
            <ul role="menubar" className="space-y-1">
                {items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <li
                            key={item.href}
                            role="menuitem"
                            tabIndex={focusIndex === index ? 0 : -1}
                            className={`
                flex items-center px-3 py-2 rounded-md text-sm
                ${focusIndex === index ? 'bg-accent' : 'hover:bg-accent/50'}
                cursor-pointer
              `}
                            onClick={() => navigate(item.href)}
                            aria-current={focusIndex === index ? 'page' : undefined}
                        >
                            {Icon && <Icon className="mr-2 h-4 w-4" />}
                            <span>{item.label}</span>
                            {item.description && (
                                <span className="sr-only">{item.description}</span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};
