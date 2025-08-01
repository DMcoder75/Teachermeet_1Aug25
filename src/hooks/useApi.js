import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(!!endpoint)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!endpoint) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Handle different endpoints
        if (endpoint === '/posts') {
          const { data: posts, error } = await supabase
            .from('posts')
            .select(`
              *,
              educator:educators(first_name, last_name, title, institution)
            `)
            .order('created_at', { ascending: false })
          
          if (error) throw error
          setData({ posts })
          
        } else if (endpoint.startsWith('/educators/suggestions/')) {
          const { data: educators, error } = await supabase
            .from('educators')
            .select('*')
            .limit(5)
          
          if (error) throw error
          setData(educators)
          
        } else {
          // Fallback for other endpoints
          const response = await fetch(`/api${endpoint}`, {
            headers: {
              'Content-Type': 'application/json',
              ...options.headers
            },
            ...options
          })
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const result = await response.json()
          setData(result)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [endpoint])

  return { data, loading, error }
}

export async function apiCall(endpoint, options = {}) {
  try {
    // Handle Supabase operations
    if (endpoint === '/posts' && options.method === 'POST') {
      const { data, error } = await supabase
        .from('posts')
        .insert([options.body])
        .select()
      
      if (error) throw error
      return data[0]
    }
    
    // Fallback to regular API calls
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

