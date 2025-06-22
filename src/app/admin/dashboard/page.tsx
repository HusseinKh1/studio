
"use client";
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getAllIssues, deleteIssue as apiDeleteIssue, updateIssue, AuthError } from '@/lib/api-service';
import type { RoadSurfaceIssueDto, RoadSurfaceIssueRequest } from '@/types/api'; 
import { IssueStatus } from '@/types/api';
import ProtectedRoute from '@/components/auth/protected-route';
import { Loader2, AlertTriangle, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const getStatusVariant = (status: IssueStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case IssueStatus.Reported: return "destructive";
    case IssueStatus.InProgress: return "secondary";
    case IssueStatus.Resolved: return "default";
    default: return "outline";
  }
};

function AdminDashboardPageContent() {
  const [issues, setIssues] = useState<RoadSurfaceIssueDto[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<RoadSurfaceIssueDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { logout } = useAuth();
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allIssues = await getAllIssues();
      setIssues(allIssues);
    } catch (err: any) {
      if (err instanceof AuthError) {
        toast({ title: "Session Expired", description: "Please log in again.", variant: "destructive" });
        logout();
      } else {
        if (!(err instanceof AuthError)) {
          console.error("Failed to fetch issues:", err);
        }
        setError(err.message || "Could not load issues.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [logout, toast]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  useEffect(() => {
    let currentIssues = issues;
    if (statusFilter !== "all") {
      currentIssues = currentIssues.filter(issue => issue.status === statusFilter);
    }
    if (searchTerm) {
      currentIssues = currentIssues.filter(issue => 
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredIssues(currentIssues);
  }, [issues, statusFilter, searchTerm]);


  const handleDeleteIssue = async (issueId: string) => {
    try {
      await apiDeleteIssue(issueId);
      toast({ title: "Issue Deleted", description: "The issue has been successfully deleted." });
      fetchIssues(); 
    } catch (err: any) {
      if (err instanceof AuthError) {
        toast({ title: "Session Expired", description: "Please log in again.", variant: "destructive" });
        logout();
      } else {
        toast({ title: "Deletion Failed", description: err.message || "Could not delete the issue.", variant: "destructive" });
      }
    }
  };
  
  const handleUpdateStatus = async (issue: RoadSurfaceIssueDto, newStatus: IssueStatus) => {
    try {
        const requestData: RoadSurfaceIssueRequest = {
            description: issue.description,
            location: issue.location,
            reportedByUserId: issue.reportedByUserId,
            status: newStatus,
        };
        await updateIssue(issue.id, requestData);
        toast({ title: "Status Updated", description: `Issue status changed to ${newStatus}.` });
        fetchIssues(); 
    } catch (err: any) {
        if (err instanceof AuthError) {
          toast({ title: "Session Expired", description: "Please log in again.", variant: "destructive" });
          logout();
        } else {
          toast({ title: "Update Failed", description: err.message || "Could not update status.", variant: "destructive" });
        }
    }
  };


  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center"><AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" /><h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Issues</h2><p className="text-muted-foreground">{error}</p><Button onClick={fetchIssues}>Try Again</Button></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-8">Admin Dashboard - All Issues</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-lg bg-card">
        <div className="flex-grow">
          <Label htmlFor="search-issues">Search Issues</Label>
          <Input 
            id="search-issues"
            placeholder="Search by description or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="status-filter">Filter by Status</Label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as IssueStatus | "all")}>
            <SelectTrigger className="w-full md:w-[180px] mt-1">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(IssueStatus).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredIssues.length === 0 ? (
         <div className="text-center py-10">
            <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No issues match your current filters.</p>
         </div>
      ) : (
        <div className="overflow-x-auto bg-card rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Description</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported Date</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium truncate max-w-xs" title={issue.description}>{issue.description}</TableCell>
                  <TableCell className="truncate max-w-xs" title={issue.location}>{issue.location}</TableCell>
                  <TableCell>
                    <Select defaultValue={issue.status} onValueChange={(newStatus) => handleUpdateStatus(issue, newStatus as IssueStatus)}>
                        <SelectTrigger className="w-[130px] h-8 text-xs [&_svg]:size-3" aria-label={`Status of issue ${issue.id}`}>
                           <Badge variant={getStatusVariant(issue.status)} className="text-xs px-1.5 py-0.5">
                             <SelectValue />
                           </Badge>
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(IssueStatus).map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{issue.reportedDate ? format(parseISO(issue.reportedDate), "PP") : "N/A"}</TableCell>
                  <TableCell>{issue.reportedByUser?.userName || (issue.reportedByUserId ? issue.reportedByUserId.substring(0,8) : 'N/A')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild title="View Issue">
                      <Link href={`/issues/${issue.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Delete Issue" className="text-destructive hover:text-destructive/80">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the issue
                            and all associated responses.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteIssue(issue.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminDashboardPageContent />
    </ProtectedRoute>
  );
}
