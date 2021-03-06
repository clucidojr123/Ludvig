import ShareDB from "sharedb/lib/client";
// import ShareDBBack from "sharedb";
import WebSocket from "ws";
// @ts-ignore
import richText from "rich-text";
// @ts-ignore -- no type declarations available at the moment
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

const LUIGI_URI = process.env.LUIGI_URI || "ws://localhost:49154";

export const wsInstance = new WebSocket(LUIGI_URI);

// @ts-ignore
export const ShareDBConnection = new ShareDB.Connection(wsInstance);

ShareDB.types.register(richText.type);

export const generateHTML = (doc: ShareDB.Doc) => {
    const result = new QuillDeltaToHtmlConverter(doc.data.ops);
    let rendered = result.convert();
    if (!rendered) {
        rendered = "<p></p>";
    }
    return rendered;
};
