"use client";

import { UserButton, SignInButton, useUser } from "@clerk/nextjs";

const UserMenu = () => {
  const { isSignedIn } = useUser();

  return (
    <div className="flex items-center">
      {isSignedIn ? (
        <UserButton afterSignOutUrl="/" />
      ) : (
        <SignInButton mode="modal">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
            ログイン
          </button>
        </SignInButton>
      )}
    </div>
  );
};

export default UserMenu; 