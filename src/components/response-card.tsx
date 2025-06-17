
"use client";
import type { PublicUtilityResponseDto } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, MessageSquare, Edit3, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';

interface ResponseCardProps {
  response: PublicUtilityResponseDto;
  onEdit?: (responseId: string) => void;
  onDelete?: (responseId: string) => void;
}

export default function ResponseCard({ response, onEdit, onDelete }: ResponseCardProps) {
  const { isAdmin } = useAuth();
  const formattedDate = response.responseDate ? format(parseISO(response.responseDate), "PPP 'at' p") : "N/A";

  return (
    <Card className="mb-4 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md font-semibold flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
            Utility Response
          </CardTitle>
          {isAdmin() && (onEdit || onDelete) && (
            <div className="space-x-2">
              {onEdit && <Button variant="ghost" size="icon" onClick={() => onEdit(response.id)}><Edit3 className="h-4 w-4" /></Button>}
              {onDelete && <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(response.id)}><Trash2 className="h-4 w-4" /></Button>}
            </div>
          )}
        </div>
        <CardDescription className="text-xs text-muted-foreground flex items-center pt-1">
          <CalendarDays className="mr-1 h-3 w-3" /> Responded: {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{response.comment}</p>
      </CardContent>
    </Card>
  );
}
