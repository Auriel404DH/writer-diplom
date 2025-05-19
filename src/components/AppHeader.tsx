import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BellIcon, LogOut, Settings, User } from 'lucide-react';

export function AppHeader() {
  const { user, logoutMutation } = useAuth();

  return (
    <header className="bg-white border-b border-neutral-200 py-2 px-4 lg:px-8">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center">
            <span className="text-primary text-xl font-bold mr-1">Литера</span>
            <span className="text-secondary text-xl font-bold">Крафт</span>
          </Link>
          
          <nav className="hidden md:flex ml-6 space-x-4">
            <Link href="/">
              <Button variant="ghost" className="text-sm font-medium px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900">
                Мои книги
              </Button>
            </Link>
            <Link href="/library">
              <Button variant="ghost" className="text-sm font-medium px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900">
                Библиотека
              </Button>
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-900 p-2 rounded-full hover:bg-neutral-100">
            <BellIcon className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'U'}`} alt={user?.username || 'Пользователь'} />
                  <AvatarFallback>{user?.username?.charAt(0) || 'У'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.username}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Профиль</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Настройки</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Выйти</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
