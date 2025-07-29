import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface RateLimitAlertProps {
  timeRemaining: number;
}

export const RateLimitAlert = ({ timeRemaining }: RateLimitAlertProps) => {
  return (
    <Alert variant="destructive" className="mt-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Muitas tentativas de login</AlertTitle>
      <AlertDescription>
        Por motivos de segurança, você precisa aguardar {timeRemaining} minutos antes de tentar novamente.
      </AlertDescription>
    </Alert>
  );
}; 