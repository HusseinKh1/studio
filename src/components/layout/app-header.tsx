
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Home, LogIn, UserPlus, LogOut, FileText, UserCircle, ShieldCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function AppHeader() {
  const { user, logout, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };
  
  const getInitials = (name: string = "") => {
    const names = name.split(' ');
    let initials = names[0] ? names[0][0] : '';
    if (names.length > 1 && names[names.length -1]) {
      initials += names[names.length - 1][0];
    }
    return initials.toUpperCase();
  }

  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-headline font-bold hover:text-accent transition-colors">
          Gomel Roads Reporter
        </Link>
        <nav className="flex items-center space-x-2 md:space-x-4">
          <Button variant="ghost" size="sm" asChild className="hover:bg-primary-foreground/10">
            <Link href="/"><Home className="mr-1 h-4 w-4" /> Home</Link>
          </Button>
          {isLoading ? (
            <div className="h-8 w-20 bg-primary-foreground/20 animate-pulse rounded-md"></div>
          ) : user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="hover:bg-primary-foreground/10">
                <Link href="/report-issue"><FileText className="mr-1 h-4 w-4" /> Report Issue</Link>
              </Button>
               <Button variant="ghost" size="sm" asChild className="hover:bg-primary-foreground/10">
                <Link href="/my-issues">My Reports</Link>
              </Button>
              {isAdmin() && (
                 <Button variant="ghost" size="sm" asChild className="hover:bg-primary-foreground/10">
                  <Link href="/admin/dashboard"><ShieldCheck className="mr-1 h-4 w-4" /> Admin</Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-primary-foreground/10">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(user.userName)}`} alt={user.userName} data-ai-hint="user avatar" />
                      <AvatarFallback>{getInitials(user.userName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.userName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem onClick={() => router.push('/profile')}>
                    Profile
                  </DropdownMenuItem> */}
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild className="bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link href="/login"><LogIn className="mr-1 h-4 w-4" /> Login</Link>
              </Button>
              <Button variant="default" size="sm" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/register"><UserPlus className="mr-1 h-4 w-4" /> Register</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
