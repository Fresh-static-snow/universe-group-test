"use client";
import { useMutation } from "@tanstack/react-query";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import type { PDFDocumentProxy } from "pdfjs-dist";
import React, { useCallback, useId, useLayoutEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { loadPdfsFromDB, savePdfToDB } from "./db";
import { PDFFile, PDFFileHistory } from "./types";
import { convertTextToPDF } from "./api";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};
const resizeObserverOptions = {};
const maxWidth = 800;

export default function HomePage() {
  const { mutateAsync } = useMutation({
    mutationKey: [convertTextToPDF.name],
    mutationFn: convertTextToPDF,
    onSuccess: async (file) => {
      setFile(file);
      await savePdfToDB(file);
      setHistory(await loadPdfsFromDB());
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const pdfInputName = "pdf-text-input";
  const pdfInputId = useId();
  const [file, setFile] = useState<PDFFile>(null);
  const [numPages, setNumPages] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState<PDFFileHistory[]>([]);

  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setInputValue(e.target.value);
  };

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;
    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const { files } = event.target;
    const file = files?.[0];

    if (file) {
      setFile(file);
      await savePdfToDB(file);
      const history = await loadPdfsFromDB();
      setHistory(history);
    }
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const text = formData.get(pdfInputName) as string;

      try {
        await mutateAsync(text);
      } catch (error: unknown) {
        console.error(error);
      }
    },
    []
  );

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
  }

  const loadHistoryPdf = (file: Blob, name: string) => {
    const pdfFile = new File([file], name, {
      type: "application/pdf",
    });
    setFile(pdfFile);
  };

  useLayoutEffect(() => {
    loadPdfsFromDB().then((history) => setHistory(history));
  }, []);

  return (
    <div className="Example">
      <header className="flex justify-between items-center gap-4">
        <div className="flex gap-2">
          <h1>History:</h1>
          <ul className="flex items-center gap-2">
            {history.length !== 0 &&
              history.map(({ name, file }, index) => (
                <li key={index}>
                  <button onClick={() => loadHistoryPdf(file, name)}>
                    {name}
                  </button>
                </li>
              ))}
            {history.length === 0 && "none"}
          </ul>
        </div>

        <form onSubmit={onSubmit} className="flex gap-4">
          <label htmlFor={pdfInputId}></label>
          <input
            id={pdfInputId}
            name={pdfInputName}
            value={inputValue}
            onChange={handleInput}
            type="text"
            placeholder="type here..."
            className="border-black border rounded outline-none p-1"
          />
          <button type="submit">Convert</button>
          <button type="reset">Reset</button>
        </form>
      </header>

      <div className="Example__container">
        <div className="Example__container__load">
          <label htmlFor="file">Load from file:</label>{" "}
          <input onChange={onFileChange} type="file" />
        </div>

        <div className="Example__container__document" ref={setContainerRef}>
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            options={options}
          >
            {Array.from(new Array(numPages), (_el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={
                  containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth
                }
              />
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
