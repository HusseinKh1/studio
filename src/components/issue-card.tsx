
"use client";
import type { RoadSurfaceIssueDto, IssueStatus } from '@/types/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MapPin, CalendarDays, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface IssueCardProps {
  issue: RoadSurfaceIssueDto;
}

const getStatusVariant = (status: IssueStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case IssueStatus.Reported:
      return "destructive"; // Using destructive for 'Reported' to make it stand out as needing attention
    case IssueStatus.InProgress:
      return "secondary";   // Using secondary (blue-ish) for 'In Progress'
    case IssueStatus.Resolved:
      return "default";   // Using default (green-ish by default or primary color) for 'Resolved'
    default:
      return "outline";
  }
};

const getStatusIcon = (status: IssueStatus) => {
  switch (status) {
    case IssueStatus.Reported:
      return <AlertTriangle className="mr-1 h-3 w-3" />;
    case IssueStatus.InProgress:
      return <Clock className="mr-1 h-3 w-3" />;
    case IssueStatus.Resolved:
      return <CheckCircle className="mr-1 h-3 w-3" />;
    default:
      return null;
  }
}

export default function IssueCard({ issue }: IssueCardProps) {
  const formattedDate = issue.reportedDate ? format(parseISO(issue.reportedDate), "PPP") : "N/A";

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-headline leading-tight mb-1 pr-2 line-clamp-2">{issue.description}</CardTitle>
          <Badge variant={getStatusVariant(issue.status)} className="whitespace-nowrap text-xs">
            {getStatusIcon(issue.status)}
            {issue.status}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground flex items-center">
          <MapPin className="mr-1 h-3 w-3" /> {issue.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Can add more details here if needed, e.g. a snippet of the description */}
        <p className="text-sm text-muted-foreground line-clamp-3">{issue.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4 border-t">
        <div className="text-xs text-muted-foreground flex items-center">
          <CalendarDays className="mr-1 h-3 w-3" /> Reported: {formattedDate}
        </div>
        <Button size="sm" asChild variant="outline">
          <Link href={`/issues/${issue.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
