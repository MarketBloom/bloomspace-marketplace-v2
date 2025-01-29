import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'

interface SignupFormData {
  full_name: string
  email: string
  password: string
  user_type: 'buyer' | 'seller'
}

export function SignupForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<SignupFormData>({
    full_name: '',
    email: '',
    password: '',
    user_type: 'buyer'
  })

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            user_type: formData.user_type
          }
        }
      })

      if (signUpError) throw signUpError

      // 2. Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user!.id,
          full_name: formData.full_name,
          email: formData.email,
          user_type: formData.user_type
        })

      if (profileError) throw profileError

      // 3. Handle successful signup
      toast.success('Account created successfully!')
      
      if (formData.user_type === 'seller') {
        navigate('/become-florist')
      } else {
        navigate('/')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignup} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          required
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <p className="text-sm text-gray-500">Must be at least 6 characters long</p>
      </div>

      <div className="space-y-2">
        <Label>I want to</Label>
        <RadioGroup
          value={formData.user_type}
          onValueChange={(value: 'buyer' | 'seller') => 
            setFormData({ ...formData, user_type: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="buyer" id="buyer" />
            <Label htmlFor="buyer">Buy Flowers</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="seller" id="seller" />
            <Label htmlFor="seller">Sell Flowers</Label>
          </div>
        </RadioGroup>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => navigate('/login')}
      >
        Already have an account? Login
      </Button>
    </form>
  )
} 