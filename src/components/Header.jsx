import { Search, Home, Users, BookOpen, MessageCircle, Bell, Menu, Users2, UserCircle2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import logoImage from '../assets/logo.png'

export default function Header({ onLogout, user }) {
  return (
    <header className="header-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={logoImage} 
              alt="Teacher-meet Logo" 
              className="logo-image"
            />
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search educators, resources, groups..."
                className="search-bar-cobalt pl-10"
              />
            </div>
          </div>

          {/* Navigation Icons */}
          <nav className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="nav-item-cobalt">
              <Home className="h-5 w-5" />
              <span className="ml-1">Home</span>
            </Button>
            <Button variant="ghost" size="sm" className="nav-item-cobalt relative">
              <Users className="h-5 w-5" />
              <span className="ml-1">My Network</span>
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-cobalt text-white text-xs flex items-center justify-center">
                2
              </Badge>
            </Button>
            <Button variant="ghost" size="sm" className="nav-item-cobalt relative">
              <BookOpen className="h-5 w-5" />
              <span className="ml-1">Resources</span>
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-cobalt text-white text-xs flex items-center justify-center">
                4
              </Badge>
            </Button>
            <Button variant="ghost" size="sm" className="nav-item-cobalt relative">
              <Users2 className="h-5 w-5" />
              <span className="ml-1">Groups</span>
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-cobalt text-white text-xs flex items-center justify-center">
                5
              </Badge>
            </Button>
            <Button variant="ghost" size="sm" className="nav-item-cobalt relative">
              <MessageCircle className="h-5 w-5" />
              <span className="ml-1">Messages</span>
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-cobalt text-white text-xs flex items-center justify-center">
                6
              </Badge>
            </Button>
            <Button variant="ghost" size="sm" className="nav-item-cobalt relative">
              <Bell className="h-5 w-5" />
              <span className="ml-1">Notifications</span>
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                7
              </Badge>
            </Button>
            <Button variant="ghost" size="sm" className="nav-item-cobalt">
              <UserCircle2 className="h-5 w-5" />
              <span className="ml-1">Profile</span>
            </Button>
            <Button variant="ghost" size="sm" className="nav-item-cobalt" onClick={onLogout}>
              <LogOut className="h-5 w-5" />
              <span className="ml-1">Logout</span>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="nav-item-cobalt">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

