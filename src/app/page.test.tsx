import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import HomePage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { indexedDB } from "fake-indexeddb";

global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));

jest.mock("./api", () => ({
  convertTextToPDF: jest.fn(() =>
    Promise.resolve(
      new File(["Mock PDF Content"], "mock.pdf", { type: "application/pdf" })
    )
  ),
}));

jest.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: { workerSrc: "mock-worker-src" },
  getDocument: jest.fn(() =>
    Promise.resolve({
      promise: Promise.resolve({
        numPages: 1,
        getPage: jest.fn(() =>
          Promise.resolve({
            getTextContent: jest.fn(() =>
              Promise.resolve({
                items: [{ str: "Hello, World!" }],
              })
            ),
          })
        ),
      }),
    })
  ),
}));

// Mock the Document component from react-pdf
jest.mock("react-pdf", () => {
  const originalModule = jest.requireActual("react-pdf");
  return {
    ...originalModule,
    Document: ({ file, onLoadSuccess }: any) => {
      React.useEffect(() => {
        if (file) {
          onLoadSuccess({ numPages: 1 });
        }
      }, [file, onLoadSuccess]);
      return <div>Mock PDF Document</div>;
    },
    Page: () => <div>Mock PDF Page</div>,
  };
});

// Mock indexedDB
global.indexedDB = indexedDB;

describe("PDF Converter Component", () => {
  it("should display the input text in the PDF after submission", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText("type here...");
    const submitButton = screen.getByText("Convert");

    const inputText = "Hello, World!";
    fireEvent.change(input, { target: { value: inputText } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Mock PDF Document")).toBeInTheDocument();
    });

    jest.restoreAllMocks();
  });
});
