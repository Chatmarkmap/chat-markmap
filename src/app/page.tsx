"use client";

import { useEffect, useMemo, useRef } from "react";

import { useChat } from "@ai-sdk/react";
import { Button, Textarea, Tooltip } from "@heroui/react";
import { CircleX, CornerDownLeft } from "lucide-react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";
import ReactMarkdown from "react-markdown";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { cn } from "@/lib/utils";

const transformer = new Transformer();

export default function Home() {
  const { messages, input, setInput, append, status, stop } = useChat();

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const refSvg = useRef<SVGSVGElement>(null);
  const refMarkmap = useRef<Markmap>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const lastContent = useMemo(() => {
    return messages.findLast((message) => message.role !== "user");
  }, [messages]);

  useEffect(() => {
    if (refMarkmap.current) return;
    const markmap = Markmap.create(refSvg.current);
    refMarkmap.current = markmap;
  }, [refSvg.current]);

  useEffect(() => {
    const markmap = refMarkmap.current;
    if (lastContent?.content && markmap) {
      const { root } = transformer.transform(lastContent.content);
      markmap.setData(root).then(() => {
        markmap.fit();
      });
    }
  }, [lastContent?.content]);

  const onSubmit = () => {
    if (!/\S/.test(input)) return;
    append({
      role: "user",
      content: input,
    });
    setInput("");
  };

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="h-[100vh] w-full overflow-hidden p-2">
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
                        {isUser ? <div className="p-2">{content}</div> : 
                          <ReactMarkdown className={"markdown"}>
                            {content}
                          </ReactMarkdown>
                        }
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
                />
                <Tooltip content={isLoading ? "Thinking" : "Submit"}>
                  <Button
                    size={"sm"}
                    color={"primary"}
                    onPress={onSubmit}
                    isDisabled={!input}
                    isLoading={isLoading}
                    isIconOnly
                  >
                    <CornerDownLeft />
                  </Button>
                </Tooltip>
                {isLoading ? (
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
          className="transition-background mr-1 w-1 rounded bg-[#999]
            hover:bg-[#333]"
        />
        <Panel defaultSize={70}  minSize={50} order={2}>
          <svg ref={refSvg} className="h-full w-full"></svg>
        </Panel>
      </PanelGroup>
    </div>
  );
}
