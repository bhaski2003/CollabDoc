import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import io from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

export default function TextEditor({ setEditorContent }) {
  const quillRef = useRef();
  const { id } = useParams();
  const [socket, setSocket] = useState(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    // Initialize the socket connection
    const socketConnection = io(import.meta.env.PROJ_DEPLOYED_SERVER_URL);
    setSocket(socketConnection);

    // Access the Quill editor instance
    const editor = quillRef.current.getEditor();

    // Disable the editor and set default loading text
    editor.disable();
    editor.setText("Loading...");

    // Request the document content based on the provided document ID
    socketConnection.emit("get-document", id);

    // Load the document when the server sends it
    socketConnection.once("load-document", (document) => {
      editor.setContents(document);
      editor.enable(); // Enable the editor once the document is loaded
    });

    // Save the document every 3 seconds
    const saveDocumentInterval = setInterval(() => {
      socketConnection.emit("save-document", editor.getContents());
    }, 3000);

    // Handle receiving changes from other users
    const handleReceiveChanges = (delta) => {
      editor.updateContents(delta);
    };
    socketConnection.on("receive-changes", handleReceiveChanges);

    // Cleanup function to clear intervals and disconnect the socket
    return () => {
      clearInterval(saveDocumentInterval);
      socketConnection.off("receive-changes", handleReceiveChanges);
      socketConnection.disconnect();
    };
  }, [id]);

  // Handle text changes and emit changes to the socket
  const handleChange = (content, delta, source) => {
    setValue(content);
    setEditorContent(content);

    // Only emit changes if they are made by the user
    if (socket && source === "user") {
      socket.emit("send-changes", delta);
    }
  };

  return (
    <div style={{ fontFamily: 'Roboto, sans-serif' }}>
    <ReactQuill
      theme="snow"
      value={value}
      onChange={handleChange}
      modules={{ toolbar: TOOLBAR_OPTIONS }}
      ref={(node) => (quillRef.current = node)}
    />
    </div>
  );
}
