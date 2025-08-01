import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiCall } from '@/hooks/useApi'
import { useState } from 'react'

export default function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likes_count || 0)
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = async () => {
    try {
      if (isLiked) {
        await apiCall(`/posts/${post.id}/unlike`, { method: 'POST' })
        setLikes(prev => prev - 1)
      } else {
        await apiCall(`/posts/${post.id}/like`, { method: 'POST' })
        setLikes(prev => prev + 1)
      }
      setIsLiked(!isLiked)
    } catch (error) {
      console.error('Failed to update like:', error)
    }
  }

  const getInitials = (author) => {
    if (author && author.first_name && author.last_name) {
      return `${author.first_name[0]}${author.last_name[0]}`
    }
    return 'UN'
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time'
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  const parseTags = (tagsString) => {
    try {
      return JSON.parse(tagsString || '[]')
    } catch {
      return []
    }
  }

  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{getInitials(post.author)}</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {post.author ? `${post.author.first_name} ${post.author.last_name}` : 'Unknown Author'}
              </h4>
              <p className="text-sm text-gray-600">{post.author?.title || 'Educator'}</p>
              <p className="text-xs text-gray-500">{formatTimestamp(post.created_at)}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-800 mb-4">{post.content}</p>
        
        {post.tags && parseTags(post.tags).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {parseTags(post.tags).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {post.image_url && (
          <div className="mb-4">
            <img 
              src={post.image_url} 
              alt="Post content" 
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-gray-600 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-500">
              <MessageCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">{post.comments_count || 0}</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-500">
              <Share2 className="h-4 w-4 mr-1" />
              <span className="text-sm">Share</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

