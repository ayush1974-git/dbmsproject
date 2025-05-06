
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Profile = () => {
  const { user } = useAuth();

  const userDetails = [
    { label: "Full Name", value: user?.name },
    { label: "Email", value: user?.email },
    { label: "Role", value: user?.role },
    { label: "User ID", value: user?.id },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">View your profile information</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src="" alt={user?.name} />
            <AvatarFallback className="bg-blue-600 text-white text-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user?.name}</CardTitle>
            <p className="text-muted-foreground">{user?.role}</p>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            {userDetails.map((detail) => (
              <div key={detail.label} className="grid grid-cols-3 gap-4 py-3 border-b last:border-0">
                <dt className="font-medium text-muted-foreground">{detail.label}</dt>
                <dd className="col-span-2">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
