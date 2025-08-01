import { UserPlus, MapPin, Calendar, Award, TrendingUp, Newspaper, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApi } from '@/hooks/useApi'

export default function ConnectionSuggestions() {
  const { data: suggestions, loading, error } = useApi('/educators/suggestions/1')

  const getInitials = (educator) => {
    if (educator && educator.first_name && educator.last_name) {
      return `${educator.first_name[0]}${educator.last_name[0]}`
    }
    return 'UN'
  }

  const parseSubjects = (subjectsString) => {
    try {
      return JSON.parse(subjectsString || '[]')
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="crisp-card cobalt-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-cobalt">People You May Know</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-gray-500">Loading suggestions...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="crisp-card cobalt-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-cobalt">People You May Know</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-gray-500">Unable to load suggestions</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displaySuggestions = suggestions?.slice(0, 3) || []

  return (
    <div className="space-y-6">
      {/* Connection Suggestions */}
      <Card className="crisp-card cobalt-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-cobalt flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            People You May Know
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {displaySuggestions.map((person) => (
            <div key={person.id} className="p-4 rounded-lg border border-gray-200 hover:border-cobalt hover:bg-blue-50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 cobalt-gradient rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white text-sm font-bold">
                      {getInitials(person)}
                    </span>
                  </div>
                  {person.is_verified && (
                    <Award className="absolute -bottom-1 -right-1 h-4 w-4 text-green-500 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-cobalt truncate">
                    {`${person.first_name} ${person.last_name}`}
                  </h4>
                  <p className="text-sm text-gray-600 font-medium">{person.title}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {person.institution}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {person.years_experience} years experience
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {parseSubjects(person.subjects).slice(0, 2).map((subject, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-cobalt text-cobalt">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button size="sm" className="btn-cobalt w-full mt-3 font-medium">
                <UserPlus className="h-3 w-3 mr-1" />
                Connect
              </Button>
            </div>
          ))}
          
          {displaySuggestions.length === 0 && (
            <div className="text-center py-4 text-gray-500">No suggestions available</div>
          )}
          
          <Button variant="outline" className="w-full mt-4 border-cobalt text-cobalt hover:bg-blue-50">
            Show more suggestions
          </Button>
        </CardContent>
      </Card>

      {/* Academic News */}
      <Card className="crisp-card cobalt-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-cobalt flex items-center">
            <Newspaper className="h-5 w-5 mr-2" />
            Academic News
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <article className="p-3 rounded-lg border border-gray-200 hover:border-cobalt hover:bg-blue-50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-8 bg-amber-100 rounded flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-cobalt text-sm leading-tight">
                    New Teaching Methods Show 40% Improvement in Student Engagement
                  </h5>
                  <p className="text-xs text-gray-500 mt-1">
                    Education Weekly • 2 hours ago
                  </p>
                </div>
              </div>
            </article>

            <article className="p-3 rounded-lg border border-gray-200 hover:border-cobalt hover:bg-blue-50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Award className="h-4 w-4 text-cobalt" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-cobalt text-sm leading-tight">
                    Global Education Summit 2025: Registration Now Open
                  </h5>
                  <p className="text-xs text-gray-500 mt-1">
                    UNESCO • 4 hours ago
                  </p>
                </div>
              </div>
            </article>

            <article className="p-3 rounded-lg border border-gray-200 hover:border-cobalt hover:bg-blue-50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-8 bg-green-100 rounded flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-cobalt text-sm leading-tight">
                    Digital Learning Tools: Best Practices for Remote Education
                  </h5>
                  <p className="text-xs text-gray-500 mt-1">
                    EdTech Today • 6 hours ago
                  </p>
                </div>
              </div>
            </article>
          </div>
          
          <Button variant="outline" className="w-full border-cobalt text-cobalt hover:bg-blue-50">
            <ExternalLink className="h-3 w-3 mr-1" />
            View all news
          </Button>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card className="crisp-card cobalt-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-cobalt flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Trending in Education
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded hover:bg-blue-50">
              <span className="text-sm font-medium text-cobalt">#AIinEducation</span>
              <Badge className="badge-cobalt text-xs">2.3k posts</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-blue-50">
              <span className="text-sm font-medium text-cobalt">#RemoteLearning</span>
              <Badge className="badge-gold text-xs">1.8k posts</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-blue-50">
              <span className="text-sm font-medium text-cobalt">#STEMEducation</span>
              <Badge className="badge-verified text-xs">1.5k posts</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-blue-50">
              <span className="text-sm font-medium text-cobalt">#InclusiveEducation</span>
              <Badge variant="outline" className="border-cobalt text-cobalt text-xs">1.2k posts</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

