import { Badge } from '@/shared/ui/primitives/badge';
import { Tag } from 'lucide-react';

interface CustomerTagDisplayProps {
  tags: string[] | null | undefined;
  maxVisible?: number;
  size?: 'sm' | 'md';
}

const TAG_COLORS = [
  'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'bg-green-100 text-green-800 hover:bg-green-200',
  'bg-purple-100 text-purple-800 hover:bg-purple-200',
  'bg-orange-100 text-orange-800 hover:bg-orange-200',
  'bg-pink-100 text-pink-800 hover:bg-pink-200',
  'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  'bg-red-100 text-red-800 hover:bg-red-200'
];

const getTagColor = (tag: string): string => {
  const index = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TAG_COLORS[index % TAG_COLORS.length];
};

export const CustomerTagDisplay = ({ 
  tags, 
  maxVisible = 3,
  size = 'sm'
}: CustomerTagDisplayProps) => {
  // Processar tags (vindas do banco podem estar em formato JSON)
  let processedTags: string[] = [];
  
  if (tags) {
    if (Array.isArray(tags)) {
      processedTags = tags;
    } else if (typeof tags === 'string') {
      try {
        processedTags = JSON.parse(tags);
      } catch {
        processedTags = [];
      }
    }
  }

  // Se não há tags, não renderizar nada
  if (processedTags.length === 0) {
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <Tag className="h-3 w-3" />
        <span className="text-xs">Sem tags</span>
      </div>
    );
  }

  const visibleTags = processedTags.slice(0, maxVisible);
  const hiddenCount = processedTags.length - maxVisible;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visibleTags.map((tag, index) => (
        <Badge
          key={`${tag}-${index}`}
          variant="outline"
          className={`
            ${getTagColor(tag)} 
            ${size === 'sm' ? 'text-xs px-1.5 py-0.5 h-5' : 'text-sm'} 
            border transition-colors cursor-default
          `}
        >
          {tag}
        </Badge>
      ))}
      
      {hiddenCount > 0 && (
        <Badge
          variant="outline"
          className={`
            bg-gray-100 text-gray-600 hover:bg-gray-200
            ${size === 'sm' ? 'text-xs px-1.5 py-0.5 h-5' : 'text-sm'} 
            border transition-colors cursor-default
          `}
        >
          +{hiddenCount}
        </Badge>
      )}
    </div>
  );
};