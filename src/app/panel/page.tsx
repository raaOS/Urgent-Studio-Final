import { redirect } from 'next/navigation';

export default function PanelRootPage() {
    // Since login is removed, we'll redirect to a default panel page.
    // The owner's order page is a sensible default.
    redirect('/panel/owner/orders');
}
