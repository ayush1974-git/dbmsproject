import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" alt={user?.username} />
                  <AvatarFallback className="bg-blue-600 text-white text-lg">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <Button size="sm" variant="outline">
                    Upload photo
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    JPEG, PNG or GIF. Max 2MB.
                  </span>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input 
                  id="name" 
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input 
                  id="phone" 
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  placeholder="Enter your phone number" 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile}>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your login and security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <Label>Two-factor authentication</Label>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="font-medium">
                      Authenticator app
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Use an authentication app to generate time-based codes.
                    </div>
                  </div>
                  <Button variant="outline">Setup</Button>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <Label>Session management</Label>
                <div className="rounded-lg border">
                  <div className="flex items-center justify-between p-4">
                    <div className="space-y-0.5">
                      <div className="font-medium">
                        Current session <Badge className="ml-2 bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last accessed: Today, 2:30 PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Email notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="email-timeoff" className="flex-1">
                      Email notifications for timeoff requests
                    </Label>
                    <Switch id="email-timeoff" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="email-documents" className="flex-1">
                      Document updates
                    </Label>
                    <Switch id="email-documents" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="email-employees" className="flex-1">
                      Employee changes
                    </Label>
                    <Switch id="email-employees" />
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Application notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="app-timeoff" className="flex-1">
                      App notifications for timeoff requests
                    </Label>
                    <Switch id="app-timeoff" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="app-documents" className="flex-1">
                      Document updates
                    </Label>
                    <Switch id="app-documents" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="app-employees" className="flex-1">
                      Employee changes
                    </Label>
                    <Switch id="app-employees" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="app-reminders" className="flex-1">
                      Reminders
                    </Label>
                    <Switch id="app-reminders" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Settings</CardTitle>
              <CardDescription>
                Manage your company information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company name</Label>
                <Input id="company-name" defaultValue="HireSync Inc" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-address">Company address</Label>
                <Input id="company-address" placeholder="Company address" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="et">
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Pacific Time (PT)</SelectItem>
                    <SelectItem value="mt">Mountain Time (MT)</SelectItem>
                    <SelectItem value="ct">Central Time (CT)</SelectItem>
                    <SelectItem value="et">Eastern Time (ET)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date-format">Date format</Label>
                <Select defaultValue="mdy">
                  <SelectTrigger id="date-format">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fiscal-year">Fiscal year start</Label>
                <Select defaultValue="jan">
                  <SelectTrigger id="fiscal-year">
                    <SelectValue placeholder="Select fiscal year start" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jan">January</SelectItem>
                    <SelectItem value="feb">February</SelectItem>
                    <SelectItem value="mar">March</SelectItem>
                    <SelectItem value="apr">April</SelectItem>
                    <SelectItem value="may">May</SelectItem>
                    <SelectItem value="jun">June</SelectItem>
                    <SelectItem value="jul">July</SelectItem>
                    <SelectItem value="aug">August</SelectItem>
                    <SelectItem value="sep">September</SelectItem>
                    <SelectItem value="oct">October</SelectItem>
                    <SelectItem value="nov">November</SelectItem>
                    <SelectItem value="dec">December</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save company settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
