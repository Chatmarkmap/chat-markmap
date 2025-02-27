"use client";

import { useEffect, useState } from "react";

import { api } from "$/convex/_generated/api";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import MDEditor from "@uiw/react-md-editor";
import { useQuery } from "convex/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { toast } from "sonner";

import { MarkMap } from "@/_components/Markmap";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { cn } from "@/lib/utils";

export default function Page() {
  const data = useQuery(api.contents.get);

  const { pending: updateContentPending, mutate: updateContent } =
    useApiMutation(api.contents.updateContent);

  const { pending: updateTitlePending, mutate: updateTitle } = useApiMutation(
    api.contents.updateTitle,
  );

  const { pending: deletePending, mutate: deleteContent } = useApiMutation(
    api.contents.deleteContent,
  );

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [selectedContent, setSelectedContent] = useState<{
    content?: string;
    title?: string;
    _id?: string;
  } | null>();

  useEffect(() => {
    data?.[0] && !selectedContent && setSelectedContent(data[0]);
  }, [data, selectedContent]);

  return (
    <>
      <div className="flex-1 overflow-hidden p-2">
        <PanelGroup direction="horizontal">
          <Panel
            id={"sidepanel"}
            defaultSize={20}
            minSize={20}
            maxSize={30}
            order={1}
            className="space-y-2 p-2"
          >
            {data?.map(({ _id, title, prompt, content }) => {
              return (
                <Card
                  key={_id}
                  className={cn({
                    "border-2 border-primary": selectedContent?._id === _id,
                  })}
                >
                  <CardHeader className="flex gap-3">
                    {title ? (
                      <div className="flex flex-col">
                        <p className="text-md line-clamp-1">{title}</p>
                        <p className="line-clamp-1 text-small text-default-500">
                          {prompt}
                        </p>
                      </div>
                    ) : (
                      <Tooltip content={prompt}>
                        <p className="text-md line-clamp-1">{prompt}</p>
                      </Tooltip>
                    )}
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <p className="line-clamp-3">{content}</p>
                  </CardBody>
                  <Divider />
                  <CardFooter className="justify-end">
                    <Button
                      variant="light"
                      color="danger"
                      size="sm"
                      onPress={() => {
                        setSelectedContent(data.find((it) => it._id === _id));
                        onDeleteOpen();
                      }}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="light"
                      color="primary"
                      size="sm"
                      onPress={() => {
                        setSelectedContent(data.find((it) => it._id === _id));
                        onEditOpen();
                      }}
                    >
                      Update Info
                    </Button>
                    <Button
                      variant="light"
                      color="primary"
                      size="sm"
                      onPress={() => {
                        setSelectedContent(data.find((it) => it._id === _id));
                      }}
                    >
                      Edit Content
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </Panel>
          <PanelResizeHandle
            className="mr-1 w-1 rounded bg-[#999] transition-background
              hover:bg-[#333]"
          />
          <Panel defaultSize={80} minSize={70} order={2}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={30} minSize={20} order={1}>
                <MDEditor
                  height={"100%"}
                  value={selectedContent?.content}
                  onChange={(v) => {
                    setSelectedContent((e) => ({ ...e, content: v }));
                  }}
                />
              </Panel>
              <PanelResizeHandle
                className="m-2 h-1 rounded bg-[#999] transition-background
                  hover:bg-[#333]"
              />
              <Panel defaultSize={40} minSize={20} order={2}>
                <MarkMap content={selectedContent?.content} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
      {selectedContent && (
        <Button
          isLoading={updateContentPending}
          color="primary"
          className="fixed bottom-10 right-2"
          size="sm"
          onPress={async () => {
            await updateContent({
              id: selectedContent._id,
              content: selectedContent.content,
            });
            toast.success("Update success");
          }}
        >
          Update Content
        </Button>
      )}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Update Title
          </ModalHeader>
          <ModalBody>
            <Input
              value={selectedContent?.title}
              onChange={(e) =>
                setSelectedContent((it) => ({ ...it, title: e.target.value }))
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onEditClose}>
              Close
            </Button>
            <Button
              color="primary"
              isLoading={updateTitlePending}
              onPress={async () => {
                await updateTitle({
                  id: selectedContent?._id,
                  title: selectedContent?.title,
                });
                onEditClose();
                toast.success("Update success");
              }}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Delete Content
          </ModalHeader>
          <ModalBody>Are you sure to delete this content?</ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onDeleteClose}>
              Close
            </Button>
            <Button
              color="danger"
              isLoading={deletePending}
              onPress={async () => {
                await deleteContent({
                  id: selectedContent?._id,
                });
                onDeleteClose();
                toast.success("Delete success");
              }}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
