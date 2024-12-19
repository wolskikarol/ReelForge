import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { createEditor, Editor, Transforms } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import jsPDF from "jspdf";
import axios from "axios";
import Cookies from "js-cookie"

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

        const isValidContent = (data) =>
          Array.isArray(data) &&
          data.every(
            (node) =>
              typeof node === "object" &&
              node.type &&
              Array.isArray(node.children) &&
              node.children.every((child) => typeof child.text === "string")
          );

        if (isValidContent(fetchedContent)) {
          setContent(fetchedContent);
        } else {
          console.warn("Invalid content format. Using initialValue.");
          setContent(initialValue);
        }
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

  const addSceneNumber = () => {
    let sceneCount = 1;

    const nodes = Array.from(Editor.nodes(editor, { match: (n) => n.type === "sceneHeading" }));
    nodes.forEach(([node, path]) => {
      Transforms.setNodes(
        editor,
        { children: [{ text: `Scene ${sceneCount}: ${node.children[0].text}` }] },
        { at: path }
      );
      sceneCount++;
    });
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
    <div style={{ marginBottom: "10px" }}>
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
      <button onClick={addSceneNumber}>Number Scenes</button>
      <button onClick={exportToPDF}>Export to PDF</button>
      <button onClick={saveScript}>Save Script</button>
    </div>
  );



  if (loading) return <p>Loading script...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Slate
      editor={editor}
      initialValue={content}
      onChange={(value) => {
        const isAstChange = editor.operations.some(
          (op) => "set_selection" !== op.type
        );
        if (isAstChange) {
          setContent(value);
        }
      }}
    >
      <Toolbar />
      <Editable placeholder="Type your script here..."
       renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={handleKeyDown}
        style={{
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          minHeight: "300px",
        }}/>

    </Slate>
  );
};

export default ScriptEditor;
