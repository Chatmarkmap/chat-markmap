import { FC, ReactElement, useEffect, useRef } from "react";

import { Button } from "@heroui/react";
import { Transformer } from "markmap-lib";
import { Markmap as MarkmapView } from "markmap-view";

import { captureSVG } from "@/lib/captureSVG";

const transformer = new Transformer();

export const MarkMap: FC<{ content?: string; actions?: ReactElement }> = ({
  actions,
  content = `
# ***Chatmarkmap***
- Convert ***AI-generated content*** to ***Mindmap***
  - Open-source on [Github](https://github.com/Cygra/chat-markmap)
  - Ask anything on the left
  - Mindmap are rendered in ***real-time***
  - Sign In and ***Save to edit***
`,
}) => {
  const refSvg = useRef<SVGSVGElement>(null);
  const refMarkmap = useRef<MarkmapView>(null);

  useEffect(() => {
    if (refMarkmap.current) return;
    const markmap = MarkmapView.create(refSvg.current);
    refMarkmap.current = markmap;
  }, [refSvg.current]);

  useEffect(() => {
    const markmap = refMarkmap.current;
    if (content && markmap) {
      const { root } = transformer.transform(content);
      markmap.setData(root).then(() => {
        markmap.fit();
      });
    }
  }, [content]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      refMarkmap.current?.fit();
    });

    if (refSvg.current) {
      resizeObserver.observe(refSvg.current);
    }

    // 清理
    return () => {
      if (refSvg.current) {
        resizeObserver.unobserve(refSvg.current);
      }
    };
  }, []);

  return (
    <div className="relative flex h-full w-full items-stretch">
      <svg ref={refSvg} className="flex-1 bg-white"></svg>
      <div className="absolute bottom-[4px] right-2 flex items-center space-x-2">
        <Button
          color="primary"
          variant="bordered"
          size="sm"
          onPress={() => {
            refSvg.current && captureSVG(refSvg.current, "chatmarkmap");
          }}
        >
          Capture as JPG
        </Button>
        {actions}
      </div>
    </div>
  );
};
