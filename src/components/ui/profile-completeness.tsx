import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ProfileCompletenessIndicatorProps {
  score: number;
  nextSuggestions: string[];
  onAddInfo?: (suggestion: string) => void;
}

export function ProfileCompletenessIndicator({
  score,
  nextSuggestions,
  onAddInfo
}: ProfileCompletenessIndicatorProps) {
  // Determinar a cor com base na pontuação
  const getProgressColor = () => {
    if (score < 30) return 'bg-red-500';
    if (score < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Completude do perfil</h4>
              <p className="text-xs text-muted-foreground">
                {score < 30 && 'Perfil básico. Adicione mais informações.'}
                {score >= 30 && score < 60 && 'Perfil em desenvolvimento. Continue melhorando.'}
                {score >= 60 && score < 90 && 'Bom perfil. Quase completo.'}
                {score >= 90 && 'Perfil completo. Excelente!'}
              </p>
            </div>
            <span className="text-2xl font-bold">{score}%</span>
          </div>

          <Progress value={score} className={`h-2 ${getProgressColor()}`} />

          {nextSuggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium">Próximos passos:</p>
              <div className="flex flex-wrap gap-2">
                {nextSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => onAddInfo && onAddInfo(suggestion)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 