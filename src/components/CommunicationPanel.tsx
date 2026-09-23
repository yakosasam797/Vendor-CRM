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
  return <span className="comm-chan comm-chan--em">{channel}</span>;
}

export function CommunicationPanel({
  linkLabel = "linked to this vendor",
  requestDraft,
}: {
  linkLabel?: string;
  requestDraft?: { id: number; body: string } | null;
}) {
  const [convos, setConvos] = useState(VENDOR_CONVERSATIONS);
  const [messages, setMessages] = useState(VENDOR_MESSAGES);
  const [activeId, setActiveId] = useState(convos[0]?.id ?? "");
  const [reply, setReply] = useState(requestDraft?.body ?? "");
  const [newOpen, setNewOpen] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState(activeId);

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

  const openRecipientPicker = () => {
    setSelectedRecipientId(active.id);
    setNewOpen(true);
  };

  const openRecipientConversation = () => {
    if (!selectedRecipientId) return;
    selectConvo(selectedRecipientId);
    setNewOpen(false);
  };

  if (!active) return null;

  return (
    <div className="comm">
      <div className="comm-list">
        <div className="comm-lhead">
          <span className="comm-lhead__lbl">Emails</span>
          <div className="comm-lhead__acts">
            <span className="comm-lhead__sum">{unread} unread</span>
            <Button variant="primary" size="sm" onClick={openRecipientPicker}>
              <IconPlus />
              New email
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
              {c.unread ? (
                <div className="comm-convo__chips">
                  <span className="comm-unread">Unread</span>
                </div>
              ) : null}
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
            placeholder="Write an email…"
            aria-label="Email reply"
          />
          <div className="comm-composer__row">
            <div className="comm-composer__left">
              <Tooltip tip="Attach a file">
                <IconButton label="Attach a file">
                  <IconAttach />
                </IconButton>
              </Tooltip>
              <Button
                variant="brand"
                size="sm"
                onClick={() =>
                  setReply(
                    "Hi, could you please share the pending compliance document at your earliest convenience? Thank you!",
                  )
                }
              >
                <IconNotes size={14} />
                Request document
              </Button>
            </div>
            <Button variant="primary" size="sm" onClick={sendReply}>
              <IconSend />
              Send email
            </Button>
          </div>
        </div>
      </div>

      {newOpen ? (
        <div className="rc-modal-backdrop" role="presentation" onClick={() => setNewOpen(false)}>
          <div
            className="rc-modal comm-recipient-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="comm-new-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="comm-modal-head">
              <div>
                <h2 id="comm-new-title" className="rc-modal__title">
                  Select recipient
                </h2>
              </div>
              <IconButton label="Close" onClick={() => setNewOpen(false)}>
                <IconClose />
              </IconButton>
            </div>
            <div className="comm-field">
              <label htmlFor="nm-recipient">Recipient</label>
              <select
                id="nm-recipient"
                value={selectedRecipientId}
                onChange={(e) => setSelectedRecipientId(e.target.value)}
                autoFocus
              >
                {convos.map((conversation) => (
                  <option key={conversation.id} value={conversation.id}>
                    {conversation.name} — {conversation.role}
                  </option>
                ))}
              </select>
            </div>
            <div className="comm-modal-foot">
              <Button variant="ghost" size="sm" onClick={() => setNewOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedRecipientId}
                onClick={openRecipientConversation}
              >
                Open conversation
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
