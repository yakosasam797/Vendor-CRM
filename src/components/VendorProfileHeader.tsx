import { Avatar, Button, StatusChip } from "@paryatech/design-system";
import { IconPencil, IconPin } from "../icons";
import { RecordHeader } from "./RecordHeader";
import "./VendorProfileHeader.css";

/**
 * Vendor detail header — same layout language as booking `.record`
 * (new-direction-03): title + one status capsule, location + ID meta,
 * assigned owner + Edit CTA.
 */
export function VendorProfileHeader({
  code,
  location,
  name,
  idea,
  status = "Active",
  ownerName,
  ownerRole = "Owner",
  ownerInitials,
  canEdit = false,
  onEdit,
}: {
  code: string;
  location: string;
  name: string;
  /** Short “idea” of the vendor (role / category), like Dubai on a booking */
  idea?: string;
  status?: string;
  ownerName: string;
  ownerRole?: string;
  ownerInitials: string;
  canEdit?: boolean;
  onEdit?: () => void;
}) {
  const title = idea ? `${name} · ${idea}` : name;
  const tone =
    status === "Active" ? "done" : status === "Setup incomplete" ? "progress" : "open";

  return (
    <RecordHeader
      title={title}
      tags={<StatusChip tone={tone}>{status}</StatusChip>}
      date={
        <span className="record-header__date">
          <IconPin size={13} />
          {location}
        </span>
      }
      recordId={code}
      idTip="Vendor code"
      aside={
        <>
          <div className="vendor-header__owner">
            <b>{ownerName}</b>
            <span>{ownerRole}</span>
          </div>
          <Avatar tone="pink" size={32} aria-hidden="true">
            {ownerInitials}
          </Avatar>
          {canEdit ? (
            <Button variant="primary" size="sm" aria-label="Edit vendor" onClick={onEdit}>
              <IconPencil />
              Edit vendor
            </Button>
          ) : null}
        </>
      }
    />
  );
}
