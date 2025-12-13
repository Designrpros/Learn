
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Ban, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default async function AdminUsersPage() {
    const allUsers = await db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Users</h2>
                    <p className="text-neutral-400">Manage user access and roles.</p>
                </div>
            </div>

            <div className="rounded-md border border-neutral-800 bg-neutral-900">
                <Table>
                    <TableHeader className="bg-neutral-950/50">
                        <TableRow className="hover:bg-transparent border-neutral-800">
                            <TableHead className="text-neutral-400">User</TableHead>
                            <TableHead className="text-neutral-400">Role</TableHead>
                            <TableHead className="text-neutral-400">Plan</TableHead>
                            <TableHead className="text-neutral-400">Joined</TableHead>
                            <TableHead className="text-right text-neutral-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allUsers.map((user) => (
                            <TableRow key={user.id} className="border-neutral-800 hover:bg-neutral-800/50">
                                <TableCell className="font-medium text-neutral-200">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`https://avatar.vercel.sh/${user.username}.png`} />
                                            <AvatarFallback>{user.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span>{user.username}</span>
                                            <span className="text-xs text-neutral-500">{user.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className={user.role === 'admin' ? "bg-purple-900 text-purple-200 hover:bg-purple-800" : "bg-neutral-800 text-neutral-400"}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="border-neutral-700 text-neutral-400">
                                        {user.plan}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-neutral-400">
                                    {format(user.createdAt, 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-neutral-400 hover:text-white">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 text-neutral-200">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem className="hover:bg-neutral-800 focus:bg-neutral-800 cursor-pointer">
                                                View details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-400 hover:bg-red-900/20 focus:bg-red-900/20 cursor-pointer">
                                                <Ban className="mr-2 h-4 w-4" />
                                                Suspend User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
