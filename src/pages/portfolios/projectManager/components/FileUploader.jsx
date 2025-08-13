import axios from "axios";
import { useState } from "react";
import pdfToText from "react-pdftotext";
import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";

export default function FileUploader({ portfolio }) {
  const apiUrl = import.meta.env.VITE_BAKEND_API;
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [matchedWords, setMatchedWords] = useState([]);
  const [aiResponse, setAIResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setMatchedWords("");
    setAIResponse("");

    if (selectedFile.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target.result); // plain text
        console.log("fileContent--------", fileContent);
      };
      reader.readAsText(selectedFile);
    } else if (selectedFile.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target.result); // data URL
        console.log("fileContent--------", fileContent);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFileContent("");
    }
  };

  const handleTextContentChange = (e) => {
    setFileContent(e.target.value);
  };

  const compareResume = async () => {
    if (!file && fileContent === "") {
      console.log(file, fileContent);
      toast.error("No job post");
      setMatchedWords([]);
      return;
    }
    const stopWords = new Set([
      "a",
      "an",
      "the",
      "in",
      "on",
      "at",
      "for",
      "of",
      "and",
      "or",
      "to",
      "with",
      "by",
      "from",
      "as",
      "is",
      "are",
      "was",
      "were",
      "be",
      "this",
      "that",
      "it",
      "using",
    ]);
    const portfolioSet = new Set();

    function recurse(value) {
      if (typeof value === "string") {
        const words = value
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .split(/\s+/);
        words.forEach((word) => {
          //exclude stop words
          if (word && !stopWords.has(word)) {
            portfolioSet.add(word);
          }
        });
      } else if (Array.isArray(value)) {
        value.forEach(recurse);
      } else if (value && typeof value === "object") {
        Object.values(value).forEach(recurse);
      }
    }

    recurse(portfolio);

    //convert pdf to text
    let extractedText = "";
    if (file?.type === "application/pdf") {
      try {
        extractedText = await pdfToText(file);
      } catch (err) {
        console.error("Failed to extract text from pdf", err);
        return;
      }
    } else {
      extractedText = fileContent;
    }

    // Process extracted text from resume
    const jobPostWords = extractedText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/);

    const jobWordsSet = new Set(jobPostWords.filter(Boolean));

    //compare sets
    const commonWords = [...jobWordsSet].filter((word) =>
      portfolioSet.has(word)
    );

    setMatchedWords(commonWords);
    console.log("Words in both portfolio and resume:", commonWords);
    console.log("Words in both portfolio and resume:", matchedWords);
    setFile(null);
    //setFileContent("");
  };

  //only compare portfolio skills
  const compareSkills = async () => {
    if (!file && fileContent === "") {
      console.log(file, fileContent);
      toast.error("No job post");
      setMatchedWords([]);
      return;
    }
    let extractedText = "";
    if (file?.type === "application/pdf") {
      try {
        extractedText = await pdfToText(file);
      } catch (err) {
        console.error("Failed to extract text from pdf", err);
        return;
      }
    } else {
      extractedText = fileContent;
    }

    // Process extracted text from resume
    const jobPostWords = extractedText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/);

    const jobWordsSet = new Set(jobPostWords.filter(Boolean));

    //portfolio Set
    const portfolioSkills = new Set(
      portfolio.skills.map((item) => item.toLowerCase())
    );
    //compare sets
    const commonWords = [...jobWordsSet].filter((word) =>
      portfolioSkills.has(word)
    );

    setMatchedWords(commonWords);
    console.log("Words in both portfolio and resume:", commonWords);
    console.log("sets", portfolioSkills, jobWordsSet);
    setFile(null);
    setFileContent(extractedText);
    setAIResponse("");
  };

  const compareWithAI = async () => {
    if (loading) return;
    const resume = portfolio;
    const jobPost = fileContent;
    if (!jobPost) {
      toast.error("No job post");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/portfolio/ai-summary`, {
        resumeJSON: resume,
        jobText: jobPost,
      });
      console.log("response", res.data);
      setAIResponse(res.data);
      setFile(null);
      setFileContent("");
      setMatchedWords("");
    } catch (error) {
      console.error("Error calling compare API:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="btn-primary w-50">
        Upload Job Posting
        <input
          type="file"
          accept=".txt,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      {!file && (
        <div className="flex flex-col space-y-2">
          <textarea
            className="mt-3 mb-3 whitespace-pre-wrap bg-slate-800 p-3 rounded min-h-48 overflow-auto"
            value={fileContent}
            onChange={handleTextContentChange}
            placeholder="Copy and Paste job posting"
          />

          <div className="flex flex-col sm:flex-row gap-4 sm:justify-between mt-4">
            <button
              className="btn-primary w-full sm:w-auto"
              onClick={compareSkills}
            >
              Compare
            </button>
            <button
              disabled={loading}
              className={`btn-primary w-full sm:w-auto ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={compareWithAI}
            >
              Compare with AI
            </button>
          </div>
        </div>
      )}
      {file && (
        <div>
          <div className="text-body-muted">
            <p>
              <strong>File Name:</strong> {file.name}
            </p>
            <p>
              <strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB
            </p>
            <p>
              <strong>Type:</strong> {file.type}
            </p>

            {file.type === "text/plain" && (
              <pre className="mt-3 mb-3 whitespace-pre-wrap bg-slate-800 p-3 rounded max-h-96 overflow-auto">
                {fileContent}
              </pre>
            )}

            {file.type === "application/pdf" && (
              <iframe
                src={fileContent}
                title="PDF Preview"
                width="100%"
                height="500px"
                className="mt-4 border rounded"
              />
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-between mt-4">
            <button
              className="btn-primary w-full sm:w-auto"
              onClick={compareSkills}
            >
              Compare
            </button>
            <button
              disabled={loading}
              className={`btn-primary w-full sm:w-auto ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={compareWithAI}
            >
              Compare with AI
            </button>
          </div>
        </div>
      )}
      {matchedWords.length > 0 && (
        <div>
          <p className="text-heading-main">Matched Skills</p>
          <ul>
            {matchedWords.map((word, index) => (
              <li key={index}>{word}</li>
            ))}
          </ul>
        </div>
      )}
      {aiResponse && (
        <div>
          <pre className="whitespace-pre-wrap break-words p-4 border rounded bg-slate-700 ">
            {aiResponse.summary}
          </pre>
        </div>
      )}
    </div>
  );
}
