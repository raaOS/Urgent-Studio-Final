
import { getUsers } from '@/services/userService';
import UsersClient from '@/components/panel/users-client';

export default async function UsersPage() {
  const users = await getUsers();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Kontrol User</h1>
        <p className="text-muted-foreground">Kelola admin dan desainer yang memiliki akses ke panel ini.</p>
      </div>
      <UsersClient initialUsers={users} />
    </div>
  );
}
