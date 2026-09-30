import { Button } from "@paryatech/design-system";
import { IconPencil, IconPin } from "../icons";
import { RecordHeader } from "./RecordHeader";

/**
 * Vendor detail header — same layout language as booking `.record`
 * (new-direction-03): title, location + ID meta,
 * without repeating section-level actions.
 */
export function VendorProfileHeader({
  code,
  location,
  name,
  canEdit = false,
  onEdit,
}: {
  code: string;
  location: string;
  name: string;
  canEdit?: boolean;
  onEdit?: () => void;
}) {
  return (
    <RecordHeader
      title={name}
      date={
        <span className="record-header__date">
          <IconPin size={13} />
          {location}
        </span>
      }
      recordId={code}
      idTip="Vendor code"
      aside={canEdit ? (
        <Button variant="primary" size="sm" onClick={onEdit}>
          <IconPencil />
          Edit vendor
        </Button>
      ) : undefined}
    />
  );
}
