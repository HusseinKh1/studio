
"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, MapPin, ShieldAlert, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground">
      {user ? (
        // Logged-in user view
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-headline font-bold mb-6 text-primary">
            Welcome back, {user.userName}!
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Ready to make Gomel's roads better? Here's what you can do:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-headline">
                  <MapPin className="mr-2 text-accent" /> Report a New Issue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Spotted a pothole or road damage? Let us know.
                </p>
                <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/report-issue">Report Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-headline">
                  <Users className="mr-2 text-primary" /> View Your Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Track the status of issues you've reported.
                </p>
                <Button asChild className="w-full">
                  <Link href="/my-issues">My Reports <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
            {isAdmin() && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-headline">
                    <ShieldAlert className="mr-2 text-destructive" /> Admin Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Manage reported issues and user interactions.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/dashboard">Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
           <div className="mt-12 p-6 bg-card rounded-lg shadow">
              <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Recent Community Activity</h2>
              <p className="text-muted-foreground">
                (Placeholder for a feed of recently reported issues or a small map preview. This feature will be implemented later.)
              </p>
            </div>
        </div>
      ) : (
        // Public landing page view
        <>
          <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold mb-6">
                Improve Gomel's Roads, Together.
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-3xl mx-auto">
                Report potholes, cracks, and other road surface issues quickly and easily. Help make our city safer and smoother for everyone.
              </p>
              <div className="space-x-4">
                <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/register">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-headline font-bold text-center text-primary mb-12">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="bg-accent text-accent-foreground rounded-full p-4 mb-4 inline-block">
                    <MapPin size={32} />
                  </div>
                  <h3 className="text-xl font-headline font-semibold mb-2 text-primary">1. Report an Issue</h3>
                  <p className="text-muted-foreground">Quickly describe the problem and pinpoint its location. Our AI can help you write a clear description.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-accent text-accent-foreground rounded-full p-4 mb-4 inline-block">
                    <ShieldAlert size={32} />
                  </div>
                  <h3 className="text-xl font-headline font-semibold mb-2 text-primary">2. Utilities Notified</h3>
                  <p className="text-muted-foreground">Your report is sent directly to Gomel Public Utilities for review and action.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-accent text-accent-foreground rounded-full p-4 mb-4 inline-block">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-headline font-semibold mb-2 text-primary">3. Track Progress</h3>
                  <p className="text-muted-foreground">Stay updated on the status of your reported issues and see when they're resolved.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-secondary/30">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <Image
                  src="https://placehold.co/600x400.png"
                  alt="City road with a pothole"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl"
                  data-ai-hint="city road pothole"
                />
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-headline font-bold text-primary mb-6">Why Report?</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="text-accent mr-2 mt-1 shrink-0" />
                    <span>Contribute to safer roads for drivers, cyclists, and pedestrians.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-accent mr-2 mt-1 shrink-0" />
                    <span>Help prevent accidents and vehicle damage.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-accent mr-2 mt-1 shrink-0" />
                    <span>Play an active role in improving our city's infrastructure.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-accent mr-2 mt-1 shrink-0" />
                    <span>Ensure public utilities are aware of critical issues.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
