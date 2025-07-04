
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Pencil, Trash2, ChevronLeft, ChevronRight, Eye, Loader2 } from "lucide-react";
import type { User, UserRole } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { getUsers, addUser, updateUser, deleteUser } from '@/services/userService';

const ITEMS_PER_PAGE = 5;

export default function UsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [formState, setFormState] = React.useState<Partial<User>>({});

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
    } catch(e) {
        const error = e instanceof Error ? e.message : "Unknown error";
        toast({ title: "Gagal Memuat Ulang Pengguna", description: error, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (isDialogOpen) {
      setFormState(editingUser ? { ...editingUser } : {
        name: '',
        email: '',
        role: 'Designer',
        avatar: 'https://placehold.co/100x100.png',
      });
    }
  }, [isDialogOpen, editingUser]);

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const currentUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (userId: string) => {
      if(!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return;
      try {
        await deleteUser(userId);
        fetchUsers();
        toast({ title: "Pengguna Dihapus", description: "Pengguna telah berhasil dihapus." });
      } catch(e) {
        const error = e instanceof Error ? e.message : "Unknown error";
        toast({ title: "Gagal Menghapus", description: error, variant: "destructive" });
      }
  }

  const handleSave = async () => {
    if(!formState.name || !formState.email || !formState.role) {
        toast({ title: "Data tidak lengkap", description: "Nama, email, dan jabatan wajib diisi.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    try {
        const userData = {
          name: formState.name,
          email: formState.email,
          role: formState.role,
          avatar: formState.avatar || 'https://placehold.co/100x100.png'
        };

        if (editingUser && editingUser.id) {
            await updateUser(editingUser.id, userData);
            toast({ title: "Pengguna Diperbarui", description: "Detail pengguna telah disimpan." });
        } else {
            await addUser(userData);
            toast({ title: "Pengguna Ditambahkan", description: "Pengguna baru telah dibuat." });
        }
        setIsDialogOpen(false);
        setEditingUser(null);
        fetchUsers();
    } catch(e) {
        const error = e instanceof Error ? e.message : "Unknown error";
        toast({ title: "Gagal Menyimpan", description: error, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
          <div>
              <CardTitle>Daftar Pengguna</CardTitle>
              <CardDescription>Total {users.length} pengguna terdaftar. Klik untuk melihat detail.</CardDescription>
          </div>
          <DialogTrigger asChild>
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pengguna
              </Button>
          </DialogTrigger>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Memuat ulang data...</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-2">
              {currentUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Belum ada pengguna yang ditambahkan.</p>
              ) : (
                currentUsers.map((user) => (
                    <AccordionItem value={user.id} key={user.id} className="border-b-0 rounded-md bg-background data-[state=open]:shadow-md">
                    <AccordionTrigger className="border rounded-md px-4 py-3 text-sm hover:no-underline hover:bg-muted/50 data-[state=open]:bg-primary/5 data-[state=open]:border-primary/20 data-[state=open]:rounded-b-none">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person avatar" />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                                    <span className="font-bold">{user.name}</span>
                                    <p className="text-xs text-muted-foreground">{user.role}</p>
                            </div>
                            </div>
                            <Eye className="h-5 w-5 text-muted-foreground mr-4" />
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 border border-t-0 rounded-md rounded-t-none border-primary/20 bg-primary/5 space-y-4">
                        <p className="text-sm"><span className="font-semibold">Email:</span> {user.email}</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Ubah
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                            </Button>
                        </div>
                    </AccordionContent>
                    </AccordionItem>
                ))
              )}
            </Accordion>
          )}
        </CardContent>
        {totalPages > 1 && !isLoading && (
         <CardFooter className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
              Halaman {currentPage} dari {totalPages}
          </span>
          <Pagination>
              <PaginationContent>
                  <PaginationItem>
                      <Button
                          variant="outline"
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                      >
                          <ChevronLeft className="h-4 w-4 mr-2"/>
                          Sebelumnya
                      </Button>
                  </PaginationItem>
                  <PaginationItem>
                       <Button
                          variant="outline"
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                      >
                          Selanjutnya
                          <ChevronRight className="h-4 w-4 ml-2"/>
                      </Button>
                  </PaginationItem>
              </PaginationContent>
          </Pagination>
      </CardFooter>
      )}
      </Card>

      <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Ubah Pengguna' : 'Tambah Pengguna Baru'}</DialogTitle>
            <DialogDescription>
              Isi detail pengguna di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" name="name" value={formState.name || ''} onChange={e => setFormState({...formState, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formState.email || ''} onChange={e => setFormState({...formState, email: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Jabatan</Label>
              <Select name="role" value={formState.role} onValueChange={value => setFormState({...formState, role: value as UserRole})}>
                  <SelectTrigger>
                      <SelectValue placeholder="Pilih Jabatan" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Owner">Owner</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Designer">Designer</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
