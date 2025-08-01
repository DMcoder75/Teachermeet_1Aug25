import { Eye, Users, BookOpen, Award, CheckCircle, TrendingUp, Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function ProfileCard({ user }) {
  const getInitials = (email) => {
    if (!email) return 'U';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return email[0].toUpperCase();
  };

  const getUserName = (email) => {
    if (!email) return 'User';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[1].charAt(0).toUpperCase() + parts[1].slice(1)}`;
    }
    return email.split('@')[0];
  };

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <Card className="crisp-card cobalt-shadow">
        <CardHeader className="text-center pb-2">
          <div className="relative mx-auto">
            <div className="w-20 h-20 cobalt-gradient rounded-full flex items-center justify-center border-4 border-white">
              <span className="text-white text-2xl font-bold">{getInitials(user?.email)}</span>
            </div>
            <CheckCircle className="absolute -bottom-1 -right-1 h-6 w-6 text-green-500 bg-white rounded-full" />
          </div>
          <h3 className="text-xl font-bold text-cobalt mt-3">{getUserName(user?.email)}</h3>
          <p className="text-sm text-gray-600 font-medium">Educator</p>
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <MapPin className="h-3 w-3" />
            Teacher-meet Community • Verified
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Credentials */}
          <div className="flex flex-wrap gap-1 justify-center">
            <Badge className="badge-verified text-xs">
              <Award className="h-3 w-3 mr-1" />
              Verified
            </Badge>
            <Badge className="badge-gold text-xs">
              Educator
            </Badge>
          </div>

          {/* Profile Completeness */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-600">Profile Strength</span>
              <span className="text-xs font-bold text-cobalt">75%</span>
            </div>
            <div className="progress-bar-cobalt">
              <div className="progress-fill-cobalt" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-gray-500">Complete your profile to reach All-Star</p>
          </div>

          <Button className="btn-cobalt w-full font-medium">
            <Eye className="h-4 w-4 mr-2" />
            View Profile
          </Button>
        </CardContent>
      </Card>

      {/* Quick Access */}
      <Card className="crisp-card cobalt-shadow">
        <CardContent className="p-4">
          <h4 className="font-semibold text-cobalt mb-3">Quick Access</h4>
          <div className="space-y-2">
            <Button variant="ghost" className="nav-item-cobalt w-full justify-start text-sm">
              <BookOpen className="h-4 w-4 mr-3" />
              My Resources
              <Badge className="ml-auto badge-cobalt">8</Badge>
            </Button>
            <Button variant="ghost" className="nav-item-cobalt w-full justify-start text-sm">
              <Users className="h-4 w-4 mr-3" />
              My Groups
              <Badge className="ml-auto bg-red-500 text-white">10</Badge>
            </Button>
            <Button variant="ghost" className="nav-item-cobalt w-full justify-start text-sm">
              <Award className="h-4 w-4 mr-3" />
              Endorsements
              <Badge className="ml-auto badge-verified">11</Badge>
            </Button>
            <Button variant="ghost" className="nav-item-cobalt w-full justify-start text-sm">
              <Calendar className="h-4 w-4 mr-3" />
              Events
              <Badge className="ml-auto bg-red-500 text-white">12</Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Dashboard */}
      <Card className="crisp-card cobalt-shadow">
        <CardContent className="p-4">
          <h4 className="font-semibold text-cobalt mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Recent Activity
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 text-amber-600 mr-2" />
                <span className="text-sm font-medium">Resources shared</span>
              </div>
              <span className="text-lg font-bold text-amber-600">12</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-cobalt mr-2" />
                <span className="text-sm font-medium">Connections</span>
              </div>
              <span className="text-lg font-bold text-cobalt">156</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm font-medium">Groups joined</span>
              </div>
              <span className="text-lg font-bold text-green-600">8</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teaching Subjects */}
      <Card className="crisp-card cobalt-shadow">
        <CardContent className="p-4">
          <h4 className="font-semibold text-cobalt mb-3">Teaching Subjects</h4>
          <div className="flex flex-wrap gap-2">
            <Badge className="badge-cobalt">Education</Badge>
            <Badge className="badge-gold">Teaching</Badge>
            <Badge className="bg-red-500 text-white">Learning</Badge>
            <Badge variant="outline" className="border-cobalt text-cobalt">Research</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

