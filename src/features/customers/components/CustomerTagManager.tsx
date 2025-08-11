import { useState, useCallback } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { toast } from '@/shared/components/use-toast';

interface CustomerTagManagerProps {
  tags: string[];
  onTagsChange: (newTags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
}

const PREDEFINED_TAGS = [
  'VIP',
  'Fiel',
  'Primeira Compra',
  'Recomendou Amigos',
  'Compra Frequente',
  'Alto Valor',
  'Especial',
  'Aniversariante',
  'Corporativo',
  'Atacado',
  'Varejo',
  'Online',
  'Presencial'
];

const TAG_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
  'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
  'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
  'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
];

export const CustomerTagManager = ({ 
  tags, 
  onTagsChange, 
  maxTags = 10,
  placeholder = "Digite uma tag personalizada..."
}: CustomerTagManagerProps) => {
  const [newTag, setNewTag] = useState('');
  const [showPredefined, setShowPredefined] = useState(false);

  const getTagColor = useCallback((tag: string): string => {
    const index = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return TAG_COLORS[index % TAG_COLORS.length];
  }, []);

  const addTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim();
    
    if (!trimmedTag) {
      toast({ title: "Tag vazia", description: "Digite uma tag válida", variant: "destructive" });
      return;
    }

    if (tags.length >= maxTags) {
      toast({ 
        title: "Limite excedido", 
        description: `Máximo de ${maxTags} tags permitidas`, 
        variant: "destructive" 
      });
      return;
    }

    if (tags.includes(trimmedTag)) {
      toast({ title: "Tag duplicada", description: "Esta tag já existe", variant: "destructive" });
      return;
    }

    onTagsChange([...tags, trimmedTag]);
    setNewTag('');
    toast({ 
      title: "Tag adicionada", 
      description: `Tag "${trimmedTag}" adicionada com sucesso`,
      variant: "success"
    });
  }, [tags, maxTags, onTagsChange]);

  const removeTag = useCallback((tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
    toast({ 
      title: "Tag removida", 
      description: `Tag "${tagToRemove}" removida`,
      variant: "warning"
    });
  }, [tags, onTagsChange]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(newTag);
    }
  };

  const availablePredefinedTags = PREDEFINED_TAGS.filter(tag => !tags.includes(tag));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          Tags Personalizadas
          <Badge variant="secondary" className="ml-auto">
            {tags.length}/{maxTags}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tags Atuais */}
        {tags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Tags Ativas</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`${getTagColor(tag)} cursor-pointer select-none`}
                >
                  <span className="mr-1">{tag}</span>
                  <X
                    className="h-3 w-3 hover:text-destructive"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Input para Nova Tag */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Adicionar Nova Tag</h4>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              maxLength={30}
              className="flex-1"
            />
            <Button
              onClick={() => addTag(newTag)}
              disabled={!newTag.trim() || tags.length >= maxTags}
              size="sm"
              className="px-3"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tags Predefinidas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">Tags Sugeridas</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPredefined(!showPredefined)}
              className="h-6 px-2 text-xs"
            >
              {showPredefined ? 'Ocultar' : 'Mostrar'} ({availablePredefinedTags.length})
            </Button>
          </div>
          
          {showPredefined && availablePredefinedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-md">
              {availablePredefinedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`${getTagColor(tag)} cursor-pointer hover:shadow-sm transition-shadow`}
                  onClick={() => addTag(tag)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className="text-xs text-muted-foreground border-t pt-3">
          <div className="flex justify-between">
            <span>Tags personalizáveis para categorização flexível</span>
            <span>Máximo 30 caracteres por tag</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};