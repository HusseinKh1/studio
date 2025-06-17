
"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getIssuesByUserId } from '@/lib/api-service';
import type { RoadSurfaceIssueDto } from '@/types/api';
import IssueCard from '@/components/issue-card';
import ProtectedRoute from '@/components/auth/protected-route';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function MyIssuesPageContent() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<RoadSurfaceIssueDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      const fetchIssues = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const userIssues = await getIssuesByUserId(user.id);
          setIssues(userIssues);
        } catch (err: any) {
          console.error("Failed to fetch user issues:", err);
          setError(err.message || "Could not load your reported issues.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchIssues();
    }
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Issues</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }
  
  if (issues.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-headline font-bold text-primary mb-4">My Reported Issues</h1>
        <p className="text-muted-foreground mb-6">You haven't reported any issues yet.</p>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/report-issue">Report Your First Issue</Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-8">My Reported Issues</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}

export default function MyIssuesPage() {
  return (
    <ProtectedRoute allowedRoles={['User', 'Admin']}>
      <MyIssuesPageContent />
    </ProtectedRoute>
  );
}
