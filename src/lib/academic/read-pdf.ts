
export async function readPdfText(
  file: File
): Promise<string> {
  const pdfjs = await import("pdfjs-dist");

  pdfjs.GlobalWorkerOptions.workerSrc =
    new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();

  const buffer = await file.arrayBuffer();

  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
  }).promise;

  const pages: string[] = [];

  for (
    let pageNumber = 1;
    pageNumber <= pdf.numPages;
    pageNumber++
  ) {
    const page = await pdf.getPage(pageNumber);

    const content = await page.getTextContent();

    const text = content.items
      .map((item) =>
        "str" in item ? item.str : ""
      )
      .join(" ");

    pages.push(text);
  }

  return pages.join("\n");
}
