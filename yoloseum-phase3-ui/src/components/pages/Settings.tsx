import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Moon, Lock, Shield, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/**
 * Settings Page Component
 * Provides tabbed interface for managing user preferences
 * Includes: Notifications, Display, Privacy, and Security settings
 */

// Validation schemas for each setting
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  tradingAlerts: z.boolean(),
  weeklyReport: z.boolean(),
});

const displaySettingsSchema = z.object({
  theme: z.enum(['light', 'dark']),
  language: z.enum(['en', 'ko']),
  densityMode: z.enum(['compact', 'comfortable', 'spacious']),
});

const securitySettingsSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
type DisplaySettings = z.infer<typeof displaySettingsSchema>;
type SecuritySettings = z.infer<typeof securitySettingsSchema>;

export function Settings() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { userProfile } = useUserProfile();
  const [activeTab, setActiveTab] = useState('notifications');
  const [notificationsSaved, setNotificationsSaved] = useState(false);
  const [displaySaved, setDisplaySaved] = useState(false);
  const [securitySaved, setSecuritySaved] = useState(false);

  // Notification form
  const notificationForm = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      tradingAlerts: true,
      weeklyReport: false,
    },
  });

  // Display form
  const displayForm = useForm<DisplaySettings>({
    resolver: zodResolver(displaySettingsSchema),
    defaultValues: {
      theme: 'dark',
      language: 'en',
      densityMode: 'comfortable',
    },
  });

  // Security form
  const securityForm = useForm<SecuritySettings>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Load user preferences when profile loads
  useEffect(() => {
    if (userProfile?.preferences) {
      displayForm.reset({
        theme: userProfile.preferences.theme,
        language: userProfile.preferences.language,
        densityMode: 'comfortable',
      });
    }
  }, [userProfile, displayForm]);

  const onNotificationSubmit = async (_values: NotificationSettings) => {
    try {
      // TODO: Update user preferences in Firestore
      console.log('Notification settings updated:', _values);
      setNotificationsSaved(true);
      setTimeout(() => setNotificationsSaved(false), 3000);
    } catch (err) {
      console.error('Error updating notifications:', err);
    }
  };

  const onDisplaySubmit = async (_values: DisplaySettings) => {
    try {
      // TODO: Update user preferences in Firestore
      console.log('Display settings updated:', _values);
      setDisplaySaved(true);
      setTimeout(() => setDisplaySaved(false), 3000);
    } catch (err) {
      console.error('Error updating display:', err);
    }
  };

  const onSecuritySubmit = async (_values: SecuritySettings) => {
    try {
      // TODO: Call Firebase function to update password
      console.log('Password update requested');
      securityForm.reset();
      setSecuritySaved(true);
      setTimeout(() => setSecuritySaved(false), 3000);
    } catch (err) {
      console.error('Error updating password:', err);
    }
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
              Please sign in to access settings
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
          onClick={() => navigate(-1)}
          variant="outline"
          className="border-slate-700 text-slate-300 hover:bg-slate-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your preferences and security</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-4 bg-slate-800 border border-slate-700">
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger
              value="display"
              className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              <Moon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              <Lock className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-500" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                    {/* Email Notifications */}
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel className="text-slate-300">Email Notifications</FormLabel>
                            <FormDescription className="text-slate-500">
                              Receive updates via email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-amber-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Push Notifications */}
                    <FormField
                      control={notificationForm.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel className="text-slate-300">Push Notifications</FormLabel>
                            <FormDescription className="text-slate-500">
                              Receive browser push notifications
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-amber-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Trading Alerts */}
                    <FormField
                      control={notificationForm.control}
                      name="tradingAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel className="text-slate-300">Trading Alerts</FormLabel>
                            <FormDescription className="text-slate-500">
                              Alert me on trades from followed strategies
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-amber-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Weekly Report */}
                    <FormField
                      control={notificationForm.control}
                      name="weeklyReport"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div>
                            <FormLabel className="text-slate-300">Weekly Summary</FormLabel>
                            <FormDescription className="text-slate-500">
                              Receive weekly performance summary
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-amber-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Save Button */}
                    <div className="pt-6 border-t border-slate-700">
                      <Button
                        type="submit"
                        className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Preferences
                      </Button>
                      {notificationsSaved && (
                        <p className="text-green-400 text-sm mt-2">Settings saved successfully</p>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Moon className="h-5 w-5 text-amber-500" />
                  Display Settings
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Customize your experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...displayForm}>
                  <form onSubmit={displayForm.handleSubmit(onDisplaySubmit)} className="space-y-6">
                    {/* Theme */}
                    <FormField
                      control={displayForm.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Theme</FormLabel>
                          <FormControl>
                            <div className="flex gap-4">
                              {(['dark', 'light'] as const).map((theme) => (
                                <label
                                  key={theme}
                                  className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer border-2 transition-colors ${
                                    field.value === theme
                                      ? 'border-amber-600 bg-amber-600/10'
                                      : 'border-slate-700 hover:border-slate-600'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    value={theme}
                                    checked={field.value === theme}
                                    onChange={() => field.onChange(theme)}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-slate-300 capitalize">{theme}</span>
                                </label>
                              ))}
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Language */}
                    <FormField
                      control={displayForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Language</FormLabel>
                          <FormControl>
                            <div className="flex gap-4">
                              {(['en', 'ko'] as const).map((lang) => (
                                <label
                                  key={lang}
                                  className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer border-2 transition-colors ${
                                    field.value === lang
                                      ? 'border-amber-600 bg-amber-600/10'
                                      : 'border-slate-700 hover:border-slate-600'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    value={lang}
                                    checked={field.value === lang}
                                    onChange={() => field.onChange(lang)}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-slate-300">{lang === 'en' ? 'English' : '한국어'}</span>
                                </label>
                              ))}
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Density Mode */}
                    <FormField
                      control={displayForm.control}
                      name="densityMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Density Mode</FormLabel>
                          <FormControl>
                            <div className="flex gap-4">
                              {(['compact', 'comfortable', 'spacious'] as const).map((mode) => (
                                <label
                                  key={mode}
                                  className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer border-2 transition-colors ${
                                    field.value === mode
                                      ? 'border-amber-600 bg-amber-600/10'
                                      : 'border-slate-700 hover:border-slate-600'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    value={mode}
                                    checked={field.value === mode}
                                    onChange={() => field.onChange(mode)}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-slate-300 capitalize">{mode}</span>
                                </label>
                              ))}
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Save Button */}
                    <div className="pt-6 border-t border-slate-700">
                      <Button
                        type="submit"
                        className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Preferences
                      </Button>
                      {displaySaved && (
                        <p className="text-green-400 text-sm mt-2">Settings saved successfully</p>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-500" />
                  Privacy Settings
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Control who can see your information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Show Profile Publicly */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-700">
                  <div>
                    <h4 className="text-slate-300 font-medium">Show Profile Publicly</h4>
                    <p className="text-sm text-slate-500">Allow others to see your profile</p>
                  </div>
                  <Switch disabled defaultChecked className="data-[state=checked]:bg-amber-600" />
                </div>

                {/* Show Investment History */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-700">
                  <div>
                    <h4 className="text-slate-300 font-medium">Show Investment History</h4>
                    <p className="text-sm text-slate-500">Display your investment history on your profile</p>
                  </div>
                  <Switch disabled className="data-[state=checked]:bg-amber-600" />
                </div>

                {/* Allow Messages */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-300 font-medium">Allow Messages</h4>
                    <p className="text-sm text-slate-500">Let other users send you direct messages</p>
                  </div>
                  <Switch disabled defaultChecked className="data-[state=checked]:bg-amber-600" />
                </div>

                <Alert className="bg-amber-600/20 border-amber-600/30 mt-6">
                  <AlertDescription className="text-amber-200">
                    Privacy settings are coming soon. Currently all privacy features are managed through your account role.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="h-5 w-5 text-amber-500" />
                  Security Settings
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...securityForm}>
                  <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                    {/* Current Password */}
                    <FormField
                      control={securityForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Current Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your current password"
                              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* New Password */}
                    <FormField
                      control={securityForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your new password"
                              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-slate-500">
                            Minimum 8 characters with uppercase and number
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    {/* Confirm Password */}
                    <FormField
                      control={securityForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm your new password"
                              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Save Button */}
                    <div className="pt-6 border-t border-slate-700">
                      <Button
                        type="submit"
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                      >
                        <Lock className="h-4 w-4" />
                        Change Password
                      </Button>
                      {securitySaved && (
                        <p className="text-green-400 text-sm mt-2">Password changed successfully</p>
                      )}
                    </div>
                  </form>
                </Form>

                {/* Active Sessions */}
                <div className="mt-8 pt-8 border-t border-slate-700">
                  <h4 className="text-slate-300 font-medium mb-4">Active Sessions</h4>
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <p className="text-sm text-slate-400">Current Device</p>
                    <p className="text-slate-200 mt-1">Chrome on Windows</p>
                    <p className="text-xs text-slate-500 mt-1">Last active: just now</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
