import { CalendarX2 } from 'lucide-react';
import { CANCELLATION_TIERS, REFUND_TIMELINE_NOTE } from '../../utils/locations/cancellationPolicy';

// Shows the location-booking cancellation & refund tiers.
const CancellationPolicyCard = ({ className = '' }) => (
  <div className={`p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 ${className}`}>
    <p className="font-semibold flex items-center gap-2 mb-2">
      <CalendarX2 className="w-4 h-4" />
      Cancellation &amp; Refund Policy
    </p>
    <p className="text-xs text-amber-800 mb-2">
      Refund is calculated on the amount you have paid, based on when you request the cancellation before check-in:
    </p>
    <ul className="divide-y divide-amber-200">
      {CANCELLATION_TIERS.map((tier) => (
        <li key={tier.label} className="flex items-center justify-between gap-3 py-1.5">
          <span>{tier.label}</span>
          <span
            className={`shrink-0 font-bold ${tier.refundPercent > 0 ? 'text-green-700' : 'text-red-700'}`}
          >
            {tier.refundPercent > 0 ? `${tier.refundPercent}% refund` : 'No refund'}
          </span>
        </li>
      ))}
    </ul>
    <p className="text-xs text-amber-800 mt-2">
      To cancel, contact us on +91 90990 48961. {REFUND_TIMELINE_NOTE}
    </p>
  </div>
);

export default CancellationPolicyCard;
