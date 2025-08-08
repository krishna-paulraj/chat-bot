import { Button } from "@/components/ui/button";
import { supabase } from "../supabase-client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

function Home() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<any[]>([]);
    const [roomId, setRoomId] = useState('');
    const [roomName, setRoomName] = useState('');

    const fetchRooms = async () => {
        const { data, error } = await supabase
            .from('rooms')
            .select('*');

        console.log('rooms', data);

        if (error) {
            console.error('Supabase error:', error);
            return;
        }

        setRooms(data || []);
    }

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleCreateRoom = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('clicked');

        if (!session) {
            console.error('No session found');
            return;
        }

        const userId = session.user.id;
        console.log('User ID:', userId);

        const { data, error } = await supabase
            .from('rooms').insert({ name: roomName }).select().single();

        if (error) {
            console.error('Supabase error:', error);
            return;
        }
        navigate(`/room/${data?.id}`);

        console.log('Chat created:', data);
    }

    const handleJoinRoom = async () => {
        navigate(`/room/${roomId}`);
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">Chat Bot</h1>
            <div className="space-x-2">

                {/* Create a Room */}
                <AlertDialog>
                    <AlertDialogTrigger>
                        <Button className="mt-4">Create Room</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Create a Room?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Create a room to chat with your friends.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <Input type="text" placeholder="Room Name" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCreateRoom}>Create</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Join a Room */}
                <AlertDialog>
                    <AlertDialogTrigger>
                        <Button className="mt-4">Join a Room</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Join a Room?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Enter a room ID to join a room.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Input type="text" placeholder="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleJoinRoom}>Join</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <Button className="mt-4" variant={"destructive"} onClick={() => supabase.auth.signOut()}>Sign Out</Button>
        </div>
    )
}

export default Home;