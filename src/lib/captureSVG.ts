export const captureSVG = async (
  source: SVGSVGElement,
  name: string,
): Promise<void> => {
  const target = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  target.innerHTML = source.innerHTML;

  for (const attr of source.attributes) {
    target.setAttribute(attr.name, attr.value);
  }

  inlineStyles(source, target);

  const svgData = new XMLSerializer().serializeToString(target);
  const canvas = document.createElement("canvas");
  const svgSize = source.getBoundingClientRect();

  canvas.width = svgSize.width;
  canvas.height = svgSize.height;
  canvas.style.width = `${svgSize.width}px`;
  canvas.style.height = `${svgSize.height}px`;

  const ctx = canvas.getContext("2d");

  ctx?.scale(1, 1);

  const img = document.createElement("img");

  img.setAttribute(
    "src",
    "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))),
  );

  return new Promise((res) => {
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const file = canvas.toDataURL(`image/jpg`, 1);
      const anchorEle = document.createElement("a");
      anchorEle.download = `${name}.jpg`;
      anchorEle.href = file;
      anchorEle.click();
      res();
    };
  });
};

function inlineStyles(source: SVGSVGElement, target: SVGSVGElement) {
  const computed = window.getComputedStyle(source);
  for (const styleKey of computed) {
    target.style[styleKey as any] = computed[styleKey as any];
  }

  for (let i = 0; i < source.children.length; i++) {
    inlineStyles(
      source.children[i] as SVGSVGElement,
      target.children[i] as SVGSVGElement,
    );
  }
}
