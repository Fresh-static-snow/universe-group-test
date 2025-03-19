import { v4 as uuidV4 } from "uuid";

export const convertTextToPDF = async (text: string) => {
  const response = await fetch(
    `http://95.217.134.12:4010/create-pdf?apiKey=${process.env.NEXT_PUBLIC_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }
  );
  const blob = await response.blob();
  return new File([blob], `${uuidV4()}.pdf`, { type: "application/pdf" });
};
