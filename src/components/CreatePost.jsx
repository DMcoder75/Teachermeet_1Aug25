import { useState } from 'react'
import { Image, Video, FileText, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '../supabaseClient'

export default function CreatePost({ user }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const getInitials = (email) => {
    if (!email) return 'U';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return email[0].toUpperCase();
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            content: content.trim(),
            educator_id: 1, // Default educator ID for demo
            type: 'text'
          }
        ])
        .select();

      if (error) throw error;
      
      setContent('');
      // Optionally trigger a refresh of posts
      window.location.reload();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">{getInitials(user?.email)}</span>
          </div>
          <div className="flex-1">
            <Textarea
              placeholder="Share your teaching insights, resources, or ask questions..."
              className="min-h-[80px] border-0 resize-none focus:ring-0 text-gray-700 placeholder-gray-500"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
              <Image className="h-5 w-5 mr-2" />
              Photo
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
              <Video className="h-5 w-5 mr-2" />
              Video
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
              <FileText className="h-5 w-5 mr-2" />
              Resource
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
              <Calendar className="h-5 w-5 mr-2" />
              Event
            </Button>
          </div>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
          >
            {loading ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

