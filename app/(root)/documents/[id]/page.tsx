import CollaborativeRoom from "@/components/CollaborativeRoom";
import { getDocument } from "@/lib/actions/room.action";
import { getClerkUsers } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Document = async ({ params: { id } }: SearchParamProps) => {
  const clecrkUser = await currentUser();

  if (!clecrkUser) redirect("/sign-in");

  const room = await getDocument({
    roomId: id,
    userId: clecrkUser.emailAddresses[0].emailAddress,
  });

  if (!room) redirect("/");

  const userIds = Object.keys(room.usersAccesses);
  const users = await getClerkUsers({ userIds });

  const usersData = users.map((user: User) => ({
    ...user,
    userType: room.usersAccesses[user.email]?.includes("room:write")
      ? "editor"
      : "viewer",
  }));

  const currentUserType = room.usersAccesses[
    clecrkUser.emailAddresses[0].emailAddress
  ]
    ? room.usersAccesses[clecrkUser.emailAddresses[0].emailAddress].includes(
        "room:write"
      )
      ? "editor"
      : "viewer"
    : "viewer"; // Default to "viewer" if the key does not exist
  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom
        roomId={id}
        roomMetadata={room.metadata}
        users={usersData}
        currentUserType={currentUserType}
      />
    </main>
  );
};

export default Document;
