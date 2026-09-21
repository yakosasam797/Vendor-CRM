import { vendorActivityForVendor } from "../data/vendorOverview";
import type { Vendor } from "../data/vendors";
import { ActivityPanel } from "./ActivityPanel";
import "./VendorActivityPanel.css";

export function VendorActivityPanel({ vendor }: { vendor: Vendor }) {
  const activity = vendorActivityForVendor(vendor);

  return (
    <section className="vendor-activity" aria-labelledby="vendor-activity-title">
      <div className="vendor-activity__head">
        <h2 id="vendor-activity-title" className="vendor-activity__title">
          Recent activities
        </h2>
        <span className="vendor-activity__count pt-mono">
          {activity.length} recent event{activity.length === 1 ? "" : "s"}
        </span>
      </div>
      <ActivityPanel
        rows={activity}
        searchPlaceholder="Search recent activity"
        ariaLabel="Recent vendor activities"
      />
    </section>
  );
}
