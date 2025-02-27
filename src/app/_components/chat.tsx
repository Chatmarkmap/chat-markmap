import { FC } from "react";
import { useEffect, useMemo, useRef } from "react";

import { api } from "$/convex/_generated/api";
import { useChat } from "@ai-sdk/react";
import { useUser } from "@clerk/nextjs";
import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { CircleX, CornerDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { toast } from "sonner";

import { MarkMap } from "@/_components/Markmap";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { cn } from "@/lib/utils";

export const LAST_DONATE_KEY = "LAST_DONATE_KEY";

export const Chat: FC<{}> = ({}) => {
  const router = useRouter();
  const { messages, input, setInput, append, status, stop } = useChat();

  const { pending: saveContentPending, mutate: saveContent } = useApiMutation(
    api.contents.create,
  );

  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const lastContent = useMemo(() => {
    return messages.findLast((message) => message.role !== "user");
  }, [messages]);

  const onSubmit = () => {
    if (!/\S/.test(input)) return;
    append({
      role: "user",
      content: input,
    });
    setInput("");
  };

  const { isSignedIn } = useUser();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const onSave = async (content: string) => {
    await saveContent({
      title: "",
      prompt: messages.findLast((message) => message.role === "user")?.content,
      content,
    });
    toast.success("Save success!");
    router.push("/my");
  };

  const isStreamLoading = status === "streaming" || status === "submitted";
  return (
    <>
      <div className="flex-1 overflow-hidden p-2">
        <PanelGroup direction="horizontal">
          <Panel id={"sidepanel"} defaultSize={30} minSize={20} order={1}>
            <div
              className="relative mb-2 mr-1 flex h-full flex-col items-stretch
                overflow-hidden rounded bg-white"
            >
              <div
                className="flex-1 overflow-y-auto overflow-x-hidden"
                ref={chatScrollRef}
              >
                <div className="flex flex-col p-2">
                  {messages.map(({ id, role, content }) => {
                    const isUser = role === "user";
                    return (
                      <div
                        key={id}
                        className={cn("mb-3 flex self-stretch", {
                          "self-end pl-6": isUser,
                          "self-start pr-6": !isUser,
                        })}
                      >
                        <div
                          className={cn("rounded px-2", { "bg-muted": isUser })}
                        >
                          {isUser ? (
                            <div className="p-2">{content}</div>
                          ) : (
                            <ReactMarkdown className={"markdown"}>
                              {content}
                            </ReactMarkdown>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 p-2">
                <div className="flex items-end space-x-2">
                  <Textarea
                    value={input}
                    onValueChange={setInput}
                    className={"flex-1"}
                    size={"sm"}
                    minRows={1}
                    maxRows={10}
                    placeholder="Ask anything"
                  />
                  <Tooltip content={isStreamLoading ? "Thinking" : "Submit"}>
                    <Button
                      size={"sm"}
                      color={"primary"}
                      onPress={onSubmit}
                      isDisabled={!input}
                      isLoading={isStreamLoading}
                      isIconOnly
                    >
                      <CornerDownLeft />
                    </Button>
                  </Tooltip>
                  {isStreamLoading ? (
                    <Tooltip content={"Stop"}>
                      <Button
                        size={"sm"}
                        isIconOnly
                        variant="light"
                        className="rounded-full"
                        onPress={stop}
                      >
                        <CircleX />
                      </Button>
                    </Tooltip>
                  ) : null}
                </div>
              </div>
            </div>
          </Panel>
          <PanelResizeHandle
            className="mr-1 w-1 rounded bg-[#999] transition-background
              hover:bg-[#333]"
          />
          <Panel defaultSize={70} minSize={50} order={2}>
            <MarkMap content={lastContent?.content} />
          </Panel>
        </PanelGroup>
      </div>
      {lastContent?.content ? (
        <Button
          isLoading={isStreamLoading || saveContentPending}
          color="primary"
          className="fixed bottom-10 right-2"
          size="sm"
          onPress={async () => {
            if (!isSignedIn) {
              toast.warning("Please sign-in to save your contents.");
              return;
            }
            const lastDonate = localStorage.getItem(LAST_DONATE_KEY);
            if (
              !lastDonate ||
              (Number(lastDonate) && Number(lastDonate) < new Date().getTime())
            ) {
              onOpen();
            } else {
              onSave(lastContent.content);
            }
          }}
        >
          Save
        </Button>
      ) : null}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Thanks for using.
          </ModalHeader>
          <ModalBody>
            <p>
              If you've found this tool useful, please donate to make it go
              further!
            </p>
            <p className="text-center">
              <Button
                className="bg-[#003087] font-semibold text-white
                  hover:bg-[#005EB8]"
                onPress={() => {
                  window
                    ?.open(
                      "https://www.paypal.com/paypalme/bohanwang11/5",
                      "_blank",
                    )
                    ?.focus();
                }}
              >
                Donate with PayPal
              </Button>
            </p>
            <p className="text-center">
              <Button
                className="bg-blue-600 font-semibold text-white
                  hover:bg-blue-700"
                onPress={() => {
                  window
                    ?.open("https://opencollective.com/chat-markmap", "_blank")
                    ?.focus();
                }}
              >
                Donate to Open Collective
              </Button>
            </p>
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button
              color="primary"
              variant="bordered"
              isLoading={saveContentPending}
              onPress={async () => {
                localStorage.setItem(
                  LAST_DONATE_KEY,
                  `${new Date().getTime()}`,
                );
                lastContent?.content && (await onSave(lastContent.content));
                onClose();
              }}
            >
              Save directly
            </Button>
            <Button
              color="primary"
              isLoading={saveContentPending}
              onPress={async () => {
                localStorage.setItem(
                  LAST_DONATE_KEY,
                  `${new Date().getTime() + 30 * 24 * 60 * 60 * 1000}`,
                );
                lastContent?.content && (await onSave(lastContent.content));
                onClose();
              }}
            >
              I've donated and Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
