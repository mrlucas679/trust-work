/**
 * SkillTestSelector Component
 * 
 * Employer-side component for selecting skill test requirements
 * Used when posting jobs/gigs
 */

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSkillTestTemplates } from '@/hooks/use-skill-test';
import { DIFFICULTY_CONFIG, DEFAULT_PASSING_SCORE } from '@/types/skill-tests';
import type { SkillTestSelectorProps, SkillTestCategory, SkillTestDifficulty } from '@/types/skill-tests';

export function SkillTestSelector({
  category,
  value,
  onChange,
  disabled = false
}: SkillTestSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: templates, isLoading } = useSkillTestTemplates(category);

  const filteredTemplates = templates?.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleRequiredChange = (required: boolean) => {
    if (!required) {
      onChange({
        required: false,
        templateId: null,
        difficulty: null,
        passingScore: DEFAULT_PASSING_SCORE
      });
    } else {
      onChange({
        ...value,
        required: true
      });
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    onChange({
      required: true,
      templateId,
      template,
      difficulty: value.difficulty || 'mid',
      passingScore: value.passingScore
    });
  };

  const handleDifficultyChange = (difficulty: SkillTestDifficulty) => {
    onChange({
      ...value,
      difficulty
    });
  };

  const handlePassingScoreChange = (passingScore: number) => {
    onChange({
      ...value,
      passingScore
    });
  };

  return (
    <Card className={disabled ? 'opacity-50' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Skill Test Requirement</CardTitle>
            <CardDescription>
              Filter unqualified applicants with a skill assessment
            </CardDescription>
          </div>
          <Switch
            checked={value.required}
            onCheckedChange={handleRequiredChange}
            disabled={disabled}
          />
        </div>
      </CardHeader>
      
      {value.required && (
        <CardContent className="space-y-4">
          {/* Template Search */}
          <div className="space-y-2">
            <Label>Search Test Templates</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                disabled={disabled}
              />
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Select Test Template</Label>
            <Select
              value={value.templateId || ''}
              onValueChange={handleTemplateChange}
              disabled={disabled || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? 'Loading...' : 'Choose a skill test'} />
              </SelectTrigger>
              <SelectContent>
                {filteredTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground">({template.category})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {value.template && (
              <p className="text-sm text-muted-foreground">
                {value.template.description}
              </p>
            )}
          </div>

          {/* Difficulty Level */}
          {value.templateId && (
            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select
                value={value.difficulty || ''}
                onValueChange={(v) => handleDifficultyChange(v as SkillTestDifficulty)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex flex-col">
                        <span className="font-medium">{config.label}</span>
                        <span className="text-xs text-muted-foreground">{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Passing Score */}
          {value.templateId && (
            <div className="space-y-2">
              <Label>Passing Score (%)</Label>
              <Select
                value={value.passingScore.toString()}
                onValueChange={(v) => handlePassingScoreChange(parseInt(v))}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">60% - Lenient</SelectItem>
                  <SelectItem value="70">70% - Standard</SelectItem>
                  <SelectItem value="80">80% - Strict</SelectItem>
                  <SelectItem value="90">90% - Very Strict</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Summary */}
          {value.templateId && value.difficulty && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Test Configuration Summary</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Test: {value.template?.name}</li>
                <li>• Difficulty: {DIFFICULTY_CONFIG[value.difficulty].label}</li>
                <li>• Questions: {DIFFICULTY_CONFIG[value.difficulty].questionCount}</li>
                <li>• Passing Score: {value.passingScore}%</li>
                <li>• Time Limit: 40 minutes</li>
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
