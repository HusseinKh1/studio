
"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getIssueById, getResponsesByIssueId, updateIssueStatus, addResponse, updateResponse as apiUpdateResponse, deleteResponse as apiDeleteResponse } from '@/lib/api-service';
import type { RoadSurfaceIssueDto, PublicUtilityResponseDto, IssueStatus, PublicUtilityResponseRequest } from '@/types/api';
import ProtectedRoute from '@/components/auth/protected-route';
import ResponseCard from '@/components/response-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, MapPin, CalendarDays, MessageSquare, Edit3, Trash2, PlusCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";


const getStatusVariant = (status: IssueStatus): "default" | "secondary" | "destructive" | "outline" => {
  // Consistent with IssueCard
  switch (status) {
    case 'Reported': return "destructive";
    case 'InProgress': return "secondary";
    case 'Resolved': return "default";
    default: return "outline";
  }
};


function IssueDetailPageContent() {
  const params = useParams();
  const id = params.id as string;
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [issue, setIssue] = useState<RoadSurfaceIssueDto | null>(null);
  const [responses, setResponses] = useState<PublicUtilityResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newResponseComment, setNewResponseComment] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [editingResponse, setEditingResponse] = useState<PublicUtilityResponseDto | null>(null);
  const [editingComment, setEditingComment] = useState("");
  const [showAddResponseDialog, setShowAddResponseDialog] = useState(false);
  const [showEditResponseDialog, setShowEditResponseDialog] = useState(false);


  const fetchIssueData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [issueData, responsesData] = await Promise.all([
        getIssueById(id),
        getResponsesByIssueId(id).catch(() => []), // Gracefully handle no responses
      ]);
      setIssue(issueData);
      setResponses(responsesData);
    } catch (err: any) {
      console.error("Failed to fetch issue details:", err);
      setError(err.message || "Could not load issue details.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchIssueData();
  }, [id]);

  const handleStatusChange = async (newStatus: IssueStatus) => {
    if (!issue) return;
    try {
      await updateIssueStatus(issue.id, newStatus);
      setIssue({ ...issue, status: newStatus });
      toast({ title: "Status Updated", description: `Issue status changed to ${newStatus}.` });
    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message || "Could not update status.", variant: "destructive" });
    }
  };

  const handleAddResponse = async () => {
    if (!issue || !newResponseComment.trim()) return;
    setIsSubmittingResponse(true);
    try {
      const responseData: PublicUtilityResponseRequest = { comment: newResponseComment, roadSurfaceIssueId: issue.id };
      const newResponse = await addResponse(responseData);
      setResponses(prev => [...prev, newResponse]);
      setNewResponseComment("");
      setShowAddResponseDialog(false);
      toast({ title: "Response Added", description: "Public utility response has been recorded." });
    } catch (err: any) {
      toast({ title: "Failed to Add Response", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmittingResponse(false);
    }
  };
  
  const handleEditResponse = (response: PublicUtilityResponseDto) => {
    setEditingResponse(response);
    setEditingComment(response.comment);
    setShowEditResponseDialog(true);
  };

  const submitEditResponse = async () => {
    if (!editingResponse || !editingComment.trim()) return;
    setIsSubmittingResponse(true);
    try {
      const updatedData: PublicUtilityResponseRequest = { comment: editingComment, roadSurfaceIssueId: editingResponse.roadSurfaceIssueId };
      await apiUpdateResponse(editingResponse.id, updatedData);
      setResponses(prev => prev.map(r => r.id === editingResponse.id ? {...r, comment: editingComment, responseDate: new Date().toISOString()} : r));
      setShowEditResponseDialog(false);
      setEditingResponse(null);
      toast({title: "Response Updated"});
    } catch (error: any) {
       toast({title: "Failed to Update Response", description: error.message, variant: "destructive"});
    } finally {
      setIsSubmittingResponse(false);
    }
  }
  
  const handleDeleteResponse = async (responseId: string) => {
    try {
      await apiDeleteResponse(responseId);
      setResponses(prev => prev.filter(r => r.id !== responseId));
      toast({title: "Response Deleted"});
    } catch (error: any) {
       toast({title: "Failed to Delete Response", description: error.message, variant: "destructive"});
    }
  }


  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center"><AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" /><h2 className="text-xl font-semibold text-destructive mb-2">Error</h2><p className="text-muted-foreground">{error}</p></div>;
  }
  if (!issue) {
    return <div className="container mx-auto px-4 py-8 text-center"><h2 className="text-xl">Issue not found.</h2></div>;
  }

  const formattedDate = issue.reportedDate ? format(parseISO(issue.reportedDate), "PPP p") : "N/A";

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle className="text-2xl md:text-3xl font-headline text-primary flex-grow">{issue.description}</CardTitle>
            <Badge variant={getStatusVariant(issue.status)} className="text-sm px-3 py-1 self-start md:self-center">{issue.status}</Badge>
          </div>
          <CardDescription className="text-sm text-muted-foreground pt-2">
            <div className="flex items-center mb-1"><MapPin className="mr-2 h-4 w-4" /> {issue.location}</div>
            <div className="flex items-center"><CalendarDays className="mr-2 h-4 w-4" /> Reported on: {formattedDate}</div>
             {issue.reportedByUser && <div className="flex items-center mt-1">By: {issue.reportedByUser.userName} ({issue.reportedByUser.email})</div>}
          </CardDescription>
        </CardHeader>
        {isAdmin() && (
          <CardContent>
            <Label htmlFor="status" className="text-sm font-medium">Update Status:</Label>
            <Select defaultValue={issue.status} onValueChange={(value) => handleStatusChange(value as IssueStatus)}>
              <SelectTrigger className="w-full md:w-[200px] mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(IssueStatus).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        )}
      </Card>

      <h2 className="text-2xl font-headline font-semibold text-primary mb-4 flex justify-between items-center">
        Public Utility Responses
        {isAdmin() && (
          <Dialog open={showAddResponseDialog} onOpenChange={setShowAddResponseDialog}>
            <DialogTrigger asChild>
              <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Response</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Response</DialogTitle>
                <DialogDescription>Provide an official response to this issue.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Label htmlFor="newResponseComment">Comment</Label>
                <Textarea 
                  id="newResponseComment" 
                  value={newResponseComment} 
                  onChange={(e) => setNewResponseComment(e.target.value)}
                  placeholder="Enter response comment..."
                  rows={4}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleAddResponse} disabled={isSubmittingResponse || !newResponseComment.trim()}>
                  {isSubmittingResponse && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Submit Response
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </h2>
      {responses.length > 0 ? (
        responses.map(response => (
          <ResponseCard 
            key={response.id} 
            response={response} 
            onEdit={isAdmin() ? handleEditResponse : undefined}
            onDelete={isAdmin() ? (responseId) => {
                 // Confirmation Dialog for Delete
                return (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the response.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteResponse(responseId)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                );
            } : undefined}
          />
        ))
      ) : (
        <p className="text-muted-foreground">No responses yet for this issue.</p>
      )}

      {/* Edit Response Dialog */}
      {editingResponse && (
        <Dialog open={showEditResponseDialog} onOpenChange={(isOpen) => { if(!isOpen) setEditingResponse(null); setShowEditResponseDialog(isOpen);}}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Response</DialogTitle>
                <DialogDescription>Update the official response to this issue.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Label htmlFor="editingComment">Comment</Label>
                <Textarea 
                  id="editingComment" 
                  value={editingComment} 
                  onChange={(e) => setEditingComment(e.target.value)}
                  rows={4}
                />
              </div>
              <DialogFooter>
                 <DialogClose asChild><Button variant="outline" onClick={() => setEditingResponse(null)}>Cancel</Button></DialogClose>
                <Button onClick={submitEditResponse} disabled={isSubmittingResponse || !editingComment.trim()}>
                  {isSubmittingResponse && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      )}

    </div>
  );
}


export default function IssueDetailPage() {
  return (
    <ProtectedRoute allowedRoles={['User', 'Admin']}>
      <IssueDetailPageContent />
    </ProtectedRoute>
  );
}
