import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createEditor, Editor, Transforms } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import jsPDF from "jspdf";
import axios from "axios";
import Cookies from "js-cookie"
import "./css/ScriptEditor.css";

const initialValue = [
  {
    type: "sceneHeading",
    children: [{ text: "INT. A ROOM - DAY" }],
  },
  {
    type: "action",
    children: [{ text: "A man walks into the room, looking around suspiciously." }],
  },
  {
    type: "character",
    children: [{ text: "JOHN" }],
  },
  {
    type: "dialogue",
    children: [{ text: "What is going on here?" }],
  },
];

const ScriptEditor = () => {
  const [editor] = useState(() => withHistory(withReact(createEditor())));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState(initialValue);
  const { projectid, scriptid } = useParams();
  const navigate = useNavigate();


const isValidContent = (data) =>
  Array.isArray(data) &&
  data.some(
    (node) =>
      typeof node === "object" &&
      node.type &&
      Array.isArray(node.children) &&
      node.children.every((child) => typeof child.text === "string")
  );

const ensureValidContent = (data) => {
  if (!isValidContent(data)) {
    return initialValue;
  }
  return data;
};

useEffect(() => {
  const fetchScript = async () => {
    try {
      const token = Cookies.get("access_token");
      const response = await axios.get(
        `http://localhost:8000/api/v1/project/${projectid}/scripts/${scriptid}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      let fetchedContent = response.data.content;

      if (typeof fetchedContent === "string") {
        try {
          const fixedContent = fetchedContent.replace(/'/g, '"');
          fetchedContent = JSON.parse(fixedContent);
        } catch (error) {
          console.error("Error parsing content:", error);
          fetchedContent = null;
        }
      }

      setContent(ensureValidContent(fetchedContent));
    } catch (error) {
      console.error("Error fetching script:", error);
      setError("Failed to fetch script.");
      setContent(initialValue);
    } finally {
      setLoading(false);
    }
  };

  fetchScript();
}, [projectid, scriptid]);

  const saveScript = async () => {
    try {
      const token = Cookies.get("access_token");
      await axios.put(
        `http://localhost:8000/api/v1/project/${projectid}/scripts/${scriptid}/`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Script saved successfully!");
    } catch (error) {
      console.error("Error saving script:", error.response?.data || error.message);
      alert("Failed to save script.");
    }
  };

  const deleteScript = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this script?");
    if (!confirmDelete) return;
  
    try {
      const token = Cookies.get("access_token");
      await axios.delete(
        `http://localhost:8000/api/v1/project/${projectid}/scripts/${scriptid}/delete/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("The script has been deleted.");
      navigate(`/project/${projectid}/scripts/`, { state: { message: "The script has been deleted." } });
    } catch (error) {
      console.error("Error deleting script:", error.response?.data || error.message);
      alert("The script could not be deleted.");
    }
  };
  


  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "sceneHeading":
        return (
          <h3 style={{ textTransform: "uppercase" }} {...props.attributes}>
            {props.children}
          </h3>
        );
      case "action":
        return (
          <p style={{ fontStyle: "italic" }} {...props.attributes}>
            {props.children}
          </p>
        );
      case "character":
        return (
          <p style={{ fontWeight: "bold", textAlign: "center" }} {...props.attributes}>
            {props.children}
          </p>
        );
      case "dialogue":
        return (
          <p style={{ textAlign: "center" }} {...props.attributes}>
            {props.children}
          </p>
        );
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props) => {
    let { attributes, children, leaf } = props;

    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }

    if (leaf.italic) {
      children = <em>{children}</em>;
    }

    return <span {...attributes}>{children}</span>;
  }, []);

  const handleKeyDown = (event) => {
    const { selection } = editor;
  
    if (selection && event.key === "Enter") {
      const [matchSceneHeading] = Editor.nodes(editor, {
        match: (n) => n.type === "sceneHeading",
      });
  
      const [matchCharacter] = Editor.nodes(editor, {
        match: (n) => n.type === "character",
      });
  
      if (matchSceneHeading) {
        event.preventDefault();
        editor.insertNode({ type: "action", children: [{ text: "" }] });
        return;
      }
  
      if (matchCharacter) {
        event.preventDefault();
        editor.insertNode({ type: "dialogue", children: [{ text: "" }] });
        return;
      }
    }
  
    if (event.key === ":") {
      const text = Editor.string(editor, selection.focus.path);
      if (text.match(/INT\.$|EXT\.$/)) {
        event.preventDefault();
        Transforms.setNodes(editor, { type: "sceneHeading" });
      }
    }
  };
  

  const toggleFormat = (editor, format) => {
    const isActive = editor.marks?.[format];
    editor.marks = { ...editor.marks, [format]: !isActive };
  };



  const exportToPDF = () => {
    const doc = new jsPDF();
    let y = 10;
  
    editor.children.forEach((node) => {
      switch (node.type) {
        case "sceneHeading":
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(14);
          doc.text(node.children[0].text.toUpperCase(), 10, y);
          y += 10;
          break;
  
        case "action":
          doc.setFont("Helvetica", "italic");
          doc.setFontSize(12);
          doc.text(node.children[0].text, 10, y);
          y += 10;
          break;
  
        case "character":
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(12);
          doc.text(node.children[0].text.toUpperCase(), 105, y, { align: "center" });
          y += 8;
          break;
  
        case "dialogue":
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(12);
          doc.text(node.children[0].text, 105, y, { align: "center" });
          y += 10;
          break;
  
        default:
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(12);
          doc.text(node.children[0].text, 10, y);
          y += 10;
          break;
      }
  
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
    });
  
    doc.save("script.pdf");
  };
  
  
  

  const Toolbar = () => (
    <div className="script-editor-toolbar">
      <button onClick={() => editor.undo()}>Undo</button>
      <button onClick={() => editor.redo()}>Redo</button>
      <button onClick={() => editor.insertNode({ type: "sceneHeading", children: [{ text: "" }] })}>
        Scene Heading
      </button>
      <button onClick={() => editor.insertNode({ type: "action", children: [{ text: "" }] })}>
        Action
      </button>
      <button onClick={() => editor.insertNode({ type: "character", children: [{ text: "" }] })}>
        Character
      </button>
      <button onClick={() => editor.insertNode({ type: "dialogue", children: [{ text: "" }] })}>
        Dialogue
      </button>
      <button onClick={exportToPDF}>Export to PDF</button>
      <button onClick={saveScript}>Save Script</button>
    </div>
  );



  if (loading) return <p className="loading-message">Loading script...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="script-editor-container">
      <Toolbar />
      <Slate
        editor={editor}
        initialValue={content}
        onChange={(value) => setContent(value)}
      >
        <Editable
          className="script-editor-content"
          placeholder="Type your script here..."
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={handleKeyDown}
        />
      </Slate>
      <button onClick={deleteScript} className="delete-button">
    Delete Script
    </button>
    </div>
  );
};

export default ScriptEditor;
