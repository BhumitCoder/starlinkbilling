import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { login, isAuthenticated } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Already logged in -> go straight to the billing system
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (login(username, password)) {
      toast({
        title: 'Welcome',
        description: 'Logged in successfully',
      });
      navigate('/', { replace: true });
    } else {
      toast({
        title: 'Login failed',
        description: 'Invalid username or password',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-invoice-border">
        <CardHeader className="text-center space-y-4">
          <img
            src="/favicon.png"
            alt="Starlink Jewels Logo"
            className="h-16 w-16 mx-auto"
          />
          <div>
            <CardTitle className="text-2xl text-invoice-blue">Starlink Jewels</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">Billing Management System</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-invoice-blue hover:bg-invoice-blue/90"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
