
"use client";
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { addIssue } from '@/lib/api-service';
import { generateIssueDescription } from '@/ai/flows/generate-issue-description';
import ProtectedRoute from '@/components/auth/protected-route';
import { Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

const reportIssueSchema = z.object({
  location: z.string().min(5, "Location is required and must be at least 5 characters.").max(200),
  briefInput: z.string().min(10, "Brief description must be at least 10 characters.").max(150).optional(),
  description: z.string().min(10, "Detailed description is required and must be at least 10 characters.").max(500),
});

type ReportIssueFormValues = z.infer<typeof reportIssueSchema>;

function ReportIssuePageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm<ReportIssueFormValues>({
    resolver: zodResolver(reportIssueSchema),
    defaultValues: {
      location: "",
      briefInput: "",
      description: "",
    },
  });

  const { watch, setValue } = form;
  const briefInputValue = watch("briefInput");
  const locationValue = watch("location");

  const handleSuggestDescription = async () => {
    if (!locationValue || !briefInputValue) {
      toast({
        title: "Missing Information",
        description: "Please provide both location and a brief description to use AI suggestion.",
        variant: "destructive",
      });
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await generateIssueDescription({
        location: locationValue,
        briefInput: briefInputValue,
      });
      setValue("description", result.suggestedDescription, { shouldValidate: true });
      toast({ title: "Suggestion Applied", description: "AI-generated description has been filled in." });
    } catch (error: any) {
      toast({
        title: "AI Suggestion Failed",
        description: error.message || "Could not generate description.",
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const onSubmit = async (data: ReportIssueFormValues) => {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to report an issue.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await addIssue({
        description: data.description,
        location: data.location,
        reportedByUserId: user.id,
      });
      toast({ title: "Issue Reported", description: "Thank you for your contribution!" });
      form.reset();
      router.push('/my-issues');
    } catch (error: any) {
      toast({
        title: "Report Failed",
        description: error.message || "Could not report issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Report a Road Issue</CardTitle>
          <CardDescription>Help us improve Gomel's roads by reporting any problems you encounter.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Sovetskaya Street, near house 25"
                {...form.register("location")}
                className={form.formState.errors.location ? "border-destructive" : ""}
              />
              {form.formState.errors.location && (
                <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="briefInput">Brief Description (for AI)</Label>
              <Textarea
                id="briefInput"
                placeholder="e.g., large pothole, cracked asphalt"
                {...form.register("briefInput")}
                rows={2}
                className={form.formState.errors.briefInput ? "border-destructive" : ""}
              />
              {form.formState.errors.briefInput && (
                <p className="text-sm text-destructive">{form.formState.errors.briefInput.message}</p>
              )}
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSuggestDescription} 
              disabled={isSuggesting || !locationValue || !briefInputValue}
              className="w-full flex items-center justify-center"
            >
              {isSuggesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4 text-accent" />
              )}
              Suggest Description with AI
            </Button>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of the issue..."
                {...form.register("description")}
                rows={5}
                className={form.formState.errors.description ? "border-destructive" : ""}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Report
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportIssuePage() {
  return (
    <ProtectedRoute allowedRoles={['User', 'Admin']}>
      <ReportIssuePageContent />
    </ProtectedRoute>
  );
}
