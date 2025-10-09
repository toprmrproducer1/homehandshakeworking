import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { SignInPage, Testimonial } from '../components/ui/sign-in';
import toast from 'react-hot-toast';

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=100",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Homehandshake completely transformed how I manage content. What used to take hours now takes minutes!"
  },
  {
    avatarSrc: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "The AI clipping feature is incredible. It finds the perfect moments in my videos every time."
  },
  {
    avatarSrc: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=100",
    name: "Emily Rodriguez",
    handle: "@davidcreates",
    text: "Multi-platform posting made easy. I reach 10x more people with half the effort."
  },
];

const SignInPageWrapper = () => {
  const navigate = useNavigate();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const [isSignUp, setIsSignUp] = React.useState(false);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!signInLoaded || !signUpLoaded) {
      toast.error('Loading authentication...');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (isSignUp) {
        // Sign up flow
        const result = await signUp.create({
          emailAddress: email,
          password: password,
        });

        if (result.status === 'complete') {
          await signIn?.create({
            identifier: email,
            password: password,
          });
          toast.success('Account created successfully!');
          navigate('/');
        } else {
          // Email verification might be required
          toast.success('Please check your email to verify your account');
        }
      } else {
        // Sign in flow
        const result = await signIn.create({
          identifier: email,
          password: password,
        });

        if (result.status === 'complete') {
          toast.success('Signed in successfully!');
          navigate('/');
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Authentication failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!signInLoaded) {
      toast.error('Loading authentication...');
      return;
    }

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      toast.error('Google sign-in failed. Please try again.');
    }
  };

  const handleResetPassword = () => {
    toast.success('Password reset link will be sent to your email');
    // Implement password reset logic here if needed
  };

  const handleCreateAccount = () => {
    setIsSignUp(!isSignUp);
    toast.success(isSignUp ? 'Switched to Sign In' : 'Switched to Sign Up');
  };

  return (
    <SignInPage
      title={
        <span className="font-light text-white tracking-tighter">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </span>
      }
      description={
        isSignUp
          ? 'Start your journey with Homehandshake today'
          : 'Sign in to access your content control center'
      }
      heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
      testimonials={sampleTestimonials}
      onSignIn={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
    />
  );
};

export default SignInPageWrapper;
