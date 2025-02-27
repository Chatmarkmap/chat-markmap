"use client";

import { FC } from "react";

import { useUser } from "@clerk/nextjs";
import { Button } from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const Header: FC<{}> = ({}) => {
  const router = useRouter();
  const { isSignedIn } = useUser();
  return (
    <div className="flex flex-1 items-center space-x-2 px-2">
      <Button
        variant="light"
        color="primary"
        onPress={() => router.push("/")}
        className="text-large"
      >
        <Image src={"/logo.svg"} alt="logo" width={160} height={28} />
      </Button>
      <iframe
        src="https://ghbtns.com/github-btn.html?user=Cygra&repo=chat-markmap&type=star&count=true&size=small"
        width="170"
        height="20"
        title="GitHub"
      />
      <div className="flex flex-1 justify-end">
        {isSignedIn && (
          <Button
            variant="bordered"
            color="primary"
            size="sm"
            onPress={() => router.push("/my")}
          >
            My Saved Contents
          </Button>
        )}
      </div>
    </div>
  );
};
