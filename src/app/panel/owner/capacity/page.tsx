
import { getCapacitySettings } from '@/services/capacityService';
import CapacityForm from '@/components/panel/capacity-form';

export default async function OrderCapacityPage() {
  const capacitySettings = await getCapacitySettings();

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">Kontrol Kapasitas Order</h1>
        <p className="text-muted-foreground">Atur batas maksimal order per minggu dan per bulan.</p>
      </div>
      <CapacityForm initialCapacity={capacitySettings} />
    </div>
  );
}
