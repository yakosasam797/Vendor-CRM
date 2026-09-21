import { useMemo, useState } from "react";
import { Button, IconButton, Tooltip } from "@paryatech/design-system";
import {
  VENDOR_CONVERSATIONS,
  VENDOR_MESSAGES,
  type Conversation,
  type ThreadMessage,
} from "../data/communications";
import { IconAttach, IconClose, IconNotes, IconPlus, IconSend } from "../icons";
import "./CommunicationPanel.css";

function AvatarBubble({
  initials,
  tone,
}: {
  initials: string;
  tone: Conversation["avatarTone"];
}) {
  return <span className={`comm-av comm-av--${tone}`}>{initials}</span>;
}

function ChannelChip({ channel }: { channel: Conversation["channel"] }) {
  return (
    <span className={`comm-chan ${channel === "WhatsApp" ? "comm-chan--wa" : "comm-chan--em"}`}>
      {channel}
    </span>
  );
}

export function CommunicationPanel({
  linkLabel = "linked to this vendor",
}: {
  linkLabel?: string;
}) {
  const [convos, setConvos] = useState(VENDOR_CONVERSATIONS);
  const [messages, setMessages] = useState(VENDOR_MESSAGES);
  const [activeId, setActiveId] = useState(convos[0]?.id ?? "");
  const [reply, setReply] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [draftRecipient, setDraftRecipient] = useState("");
  const [draftChannel, setDraftChannel] = useState<"WhatsApp" | "Email">("WhatsApp");
  const [draftBody, setDraftBody] = useState("");

  const active = convos.find((c) => c.id === activeId) ?? convos[0];
  const thread = messages[active?.id ?? ""] ?? [];
  const unread = useMemo(() => convos.filter((c) => c.unread).length, [convos]);

  const selectConvo = (id: string) => {
    setActiveId(id);
    setConvos((list) => list.map((c) => (c.id === id ? { ...c, unread: false } : c)));
  };

  const sendReply = () => {
    const body = reply.trim();
    if (!body || !active) return;
    const next: ThreadMessage = {
      dir: "out",
      body,
      meta: "You · just now",
    };
    setMessages((all) => ({
      ...all,
      [active.id]: [...(all[active.id] ?? []), next],
    }));
    setConvos((list) =>
      list.map((c) => (c.id === active.id ? { ...c, preview: body, time: "Just now" } : c)),
    );
    setReply("");
  };

  const sendNew = () => {
    const name = draftRecipient.trim();
    const body = draftBody.trim();
    if (!name || !body) return;
    const id = `cv-${Date.now()}`;
    const convo: Conversation = {
      id,
      name,
      initials: name
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join(""),
      avatarTone: "pink",
      role: "New conversation",
      channel: draftChannel,
      time: "Just now",
      preview: body,
      unread: false,
    };
    setConvos((list) => [convo, ...list]);
    setMessages((all) => ({
      ...all,
      [id]: [{ dir: "out", body, meta: "You · just now" }],
    }));
    setActiveId(id);
    setNewOpen(false);
    setDraftRecipient("");
    setDraftBody("");
  };

  if (!active) return null;

  return (
    <div className="comm">
      <div className="comm-list">
        <div className="comm-lhead">
          <span className="comm-lhead__lbl">Conversations</span>
          <div className="comm-lhead__acts">
            <span className="comm-lhead__sum">{unread} unread</span>
            <Button variant="primary" size="sm" onClick={() => setNewOpen(true)}>
              <IconPlus />
              New message
            </Button>
          </div>
        </div>
        <div className="comm-scroll">
          {convos.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`comm-convo${c.id === active.id ? " comm-convo--on" : ""}`}
              onClick={() => selectConvo(c.id)}
            >
              <div className="comm-convo__top">
                <AvatarBubble initials={c.initials} tone={c.avatarTone} />
                <div className="comm-convo__idns">
                  <div className="comm-convo__row1">
                    <span className="comm-convo__name">{c.name}</span>
                    <span className="comm-convo__time">{c.time}</span>
                  </div>
                  <div className="comm-convo__role">{c.role}</div>
                </div>
              </div>
              <div className="comm-convo__prev">{c.preview}</div>
              <div className="comm-convo__chips">
                <ChannelChip channel={c.channel} />
                {c.unread ? <span className="comm-unread">Unread</span> : null}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="comm-thread">
        <div className="comm-thread__head">
          <div className="comm-thread__name">
            <b>{active.name}</b>
            <ChannelChip channel={active.channel} />
          </div>
          <div className="comm-thread__sub">
            {active.role} · {linkLabel}
          </div>
        </div>

        <div className="comm-thread__body">
          {thread.map((msg, i) => (
            <div
              key={i}
              className={`comm-msg ${msg.dir === "out" ? "comm-msg--out" : "comm-msg--in"}`}
            >
              <div>{msg.body}</div>
              {msg.attachTitle ? (
                <div className="comm-att">
                  <div className="comm-att__title">
                    <IconNotes size={15} />
                    {msg.attachTitle}
                  </div>
                  <div className="comm-att__file">{msg.attachFile}</div>
                  <div className="comm-att__acts">
                    <Button variant="primary" size="sm">
                      Save to Documents
                    </Button>
                    <Button variant="brand" size="sm">
                      Preview
                    </Button>
                  </div>
                </div>
              ) : null}
              <div className="comm-msg__meta">{msg.meta}</div>
            </div>
          ))}
        </div>

        <div className="comm-composer">
          <textarea
            rows={2}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={`Reply on ${active.channel}…`}
            aria-label="Reply"
          />
          <div className="comm-composer__row">
            <div className="comm-composer__left">
              <Tooltip tip="Attach a file">
                <IconButton label="Attach a file">
                  <IconAttach />
                </IconButton>
              </Tooltip>
              <Button variant="brand" size="sm">
                <IconNotes size={14} />
                Request document
              </Button>
            </div>
            <Button variant="primary" size="sm" onClick={sendReply}>
              <IconSend />
              Send via {active.channel}
            </Button>
          </div>
        </div>
      </div>

      {newOpen ? (
        <div className="rc-modal-backdrop" role="presentation" onClick={() => setNewOpen(false)}>
          <div
            className="rc-modal"
            role="dialog"
            aria-labelledby="comm-new-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <p className="comm-modal-eyebrow">Communication</p>
                <h2 id="comm-new-title" className="rc-modal__title">
                  New message
                </h2>
              </div>
              <IconButton label="Close" onClick={() => setNewOpen(false)}>
                <IconClose />
              </IconButton>
            </div>
            <div className="comm-field">
              <label htmlFor="nm-recipient">Recipient</label>
              <input
                id="nm-recipient"
                value={draftRecipient}
                onChange={(e) => setDraftRecipient(e.target.value)}
                placeholder="Customer or vendor"
              />
            </div>
            <div className="comm-field">
              <label htmlFor="nm-channel">Channel</label>
              <select
                id="nm-channel"
                value={draftChannel}
                onChange={(e) => setDraftChannel(e.target.value as "WhatsApp" | "Email")}
              >
                <option>WhatsApp</option>
                <option>Email</option>
              </select>
            </div>
            <div className="comm-field">
              <label htmlFor="nm-msg">Message</label>
              <textarea
                id="nm-msg"
                rows={4}
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
              />
            </div>
            <div className="comm-modal-foot">
              <Button variant="ghost" size="sm" onClick={() => setNewOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={sendNew}>
                Send
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
