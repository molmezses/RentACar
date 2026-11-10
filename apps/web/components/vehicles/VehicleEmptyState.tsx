//Firma henüz araç eklemediyse açıklayıcı mesaj gösteririz

import EmptyState from "@/components/ui/empty-state";

type VehicleEmptyStateProps = {
  hasFilters?: boolean;   //araç olup olmama durumu
};

export default function VehicleEmptyState({
  hasFilters = false,
}: VehicleEmptyStateProps) {
  if (hasFilters) {
    return (
      <EmptyState
        title="Araç bulunamadı"
        description="Arama veya filtre kriterlerinize uygun araç bulunamadı."
      />
    );
  }

  return (
    <EmptyState
      title="Henüz araç eklenmedi"
      description="Filonuzu yönetmeye başlamak için ilk aracınızı ekleyin."
    />
  );
}
