import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Edit2, Save, X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { profileFormSchema, type ProfileFormValues } from '@/lib/validations/profile';
import { FirebaseTimestamp } from '@/types/firestore';
import { ProfileSkeleton } from '@/components/common/Skeletons';

/**
 * Profile Page Component
 * Displays and allows editing of user profile information
 * Supports profile photo upload and social media links
 */
export function Profile() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { userProfile, loading, error } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: userProfile?.displayName || '',
      email: userProfile?.email || '',
      bio: userProfile?.bio || '',
      walletAddress: userProfile?.walletAddress || '',
      youtubeUrl: userProfile?.bio || '', // Placeholder - extend User type as needed
      twitterUrl: '',
      discordUsername: '',
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (userProfile) {
      form.reset({
        displayName: userProfile.displayName,
        email: userProfile.email,
        bio: userProfile.bio,
        walletAddress: userProfile.walletAddress || '',
        youtubeUrl: '',
        twitterUrl: '',
        discordUsername: '',
      });
    }
  }, [userProfile, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      // TODO: Implement Firebase Firestore update
      // await updateUserProfile(userProfile?.uid, values);
      console.log('Profile update submitted:', values);
      setIsEditing(false);
      // Show success toast
    } catch (err) {
      console.error('Error updating profile:', err);
      // Show error toast
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!authUser) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Alert className="bg-red-600/20 border-red-600">
            <AlertDescription className="text-red-200">
              Please sign in to view your profile
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
            <p className="text-slate-400">Manage your profile information</p>
          </div>
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Alert className="bg-red-600/20 border-red-600">
            <AlertDescription className="text-red-200">
              {error?.message || 'Failed to load profile'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          onClick={() => {
            setIsEditing(false);
            navigate(-1);
          }}
          variant="outline"
          className="border-slate-700 text-slate-300 hover:bg-slate-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Profile Header Card */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userProfile.photoURL ?? undefined} alt={userProfile.displayName} />
                  <AvatarFallback className="bg-amber-600 text-white text-2xl">
                    {userProfile.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <CardTitle className="text-3xl text-white mb-2">{userProfile.displayName}</CardTitle>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className="bg-blue-600 hover:bg-blue-700">{userProfile.role}</Badge>
                    {userProfile.verified && (
                      <Badge className="bg-green-600 hover:bg-green-700">✓ Verified</Badge>
                    )}
                    {userProfile.kycStatus === 'approved' && (
                      <Badge className="bg-amber-600 hover:bg-amber-700">KYC Approved</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{userProfile.email}</p>
                </div>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Bio */}
            {userProfile.bio && (
              <CardDescription className="text-slate-400 mt-4 text-base">{userProfile.bio}</CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Profile Information & Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* User Info Card */}
          <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={userProfile?.photoURL || undefined}
                    alt={userProfile?.displayName}
                  />
                  <AvatarFallback className="bg-amber-600 text-white">
                    {userProfile?.displayName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl font-bold text-white">
                    {userProfile?.displayName || 'No name'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {userProfile?.email}
                  </p>
                  {userProfile?.verified && (
                    <Badge className="bg-green-600 mt-2">Verified</Badge>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <p className="text-sm text-slate-400 mb-2">Bio</p>
                <p className="text-slate-300">
                  {userProfile?.bio || 'No bio added'}
                </p>
              </div>

              {/* Wallet Address */}
              <div>
                <p className="text-sm text-slate-400 mb-2">Wallet Address</p>
                <div className="flex items-center gap-2">
                  <code className="bg-slate-700 px-3 py-2 rounded text-amber-400 text-sm flex-1 overflow-auto">
                    {userProfile?.walletAddress
                      ? `${userProfile.walletAddress.slice(0, 6)}...${userProfile.walletAddress.slice(-4)}`
                      : 'Not connected'}
                  </code>
                  {userProfile?.walletAddress && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(userProfile.walletAddress || '');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-slate-400 hover:text-amber-400"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Joined</p>
                <p className="text-white font-semibold">
                  {userProfile?.createdAt
                    ? FirebaseTimestamp.toLocaleDateString(userProfile.createdAt)
                    : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Role</p>
                <Badge className="bg-blue-600 capitalize">
                  {userProfile?.role || 'spectator'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-400">Following Count</p>
                <p className="text-white font-semibold">
                  {userProfile?.stats?.followingCount || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Invested</p>
                <p className="text-white font-semibold">
                  ${userProfile?.stats?.totalInvested?.toLocaleString('en-US', { maximumFractionDigits: 2 }) || '0'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Earnings</p>
                <p className="text-green-400 font-semibold">
                  ${userProfile?.stats?.totalEarnings?.toLocaleString('en-US', { maximumFractionDigits: 2 }) || '0'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Favorite Traders */}
        {userProfile?.stats?.favoriteTraders && userProfile.stats.favoriteTraders.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Favorite Traders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {userProfile.stats.favoriteTraders.map((traderId) => (
                  <Button
                    key={traderId}
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 justify-start"
                    onClick={() => navigate(`/trader/${traderId}`)}
                  >
                    {traderId}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isEditing ? (
          // Edit Form
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Edit Profile</CardTitle>
              <CardDescription className="text-slate-400">Update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Display Name */}
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Display Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your display name"
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* Email (Read-only) */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your email"
                            disabled
                            className="bg-slate-700 border-slate-600 text-slate-400 placeholder:text-slate-600"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-slate-500">
                          Email cannot be changed. Contact support to update.
                        </FormDescription>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* Bio */}
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about yourself"
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-slate-500">
                          {field.value?.length || 0}/500 characters
                        </FormDescription>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* Wallet Address */}
                  <FormField
                    control={form.control}
                    name="walletAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Solana Wallet Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your Solana wallet address"
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-slate-500">
                          Your wallet address for deposits and withdrawals
                        </FormDescription>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* YouTube URL */}
                  <FormField
                    control={form.control}
                    name="youtubeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">YouTube Channel</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://youtube.com/@yourname"
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* Twitter URL */}
                  <FormField
                    control={form.control}
                    name="twitterUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Twitter Profile</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://twitter.com/yourname"
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* Discord Username */}
                  <FormField
                    control={form.control}
                    name="discordUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Discord Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="username#1234"
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-6 border-t border-slate-700">
                    <Button
                      type="submit"
                      className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        form.reset();
                      }}
                      variant="outline"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          // Profile Details View
          <>
            {/* Wallet Section */}
            {userProfile.walletAddress && (
              <Card className="bg-slate-800/50 border-slate-700 mb-8">
                <CardHeader>
                  <CardTitle className="text-white">Wallet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 mb-1">Solana Address</p>
                      <p className="text-sm text-amber-400 font-mono break-all">{userProfile.walletAddress}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(userProfile.walletAddress || '')}
                      className="ml-4 border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Details */}
            <Card className="bg-slate-800/50 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Email</p>
                  <p className="text-sm text-slate-200">{userProfile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Role</p>
                  <p className="text-sm text-slate-200 capitalize">{userProfile.role}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Account Created</p>
                  <p className="text-sm text-slate-200">
                    {FirebaseTimestamp.toLocaleDateString(userProfile.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Last Updated</p>
                  <p className="text-sm text-slate-200">
                    {FirebaseTimestamp.toLocaleDateString(userProfile.updatedAt)}
                  </p>
                </div>
                {userProfile.verified && userProfile.verifiedAt && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Verified On</p>
                    <p className="text-sm text-green-400">
                      {FirebaseTimestamp.toLocaleDateString(userProfile.verifiedAt)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
