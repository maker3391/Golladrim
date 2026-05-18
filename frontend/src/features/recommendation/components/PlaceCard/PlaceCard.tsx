import { ExternalLink, MapPin, Phone } from "lucide-react";
import { PlaceResponse } from "@/features/recommendation/types/recommendation.types";
import styles from "./PlaceCard.module.css";

interface PlaceCardProps {
  place: PlaceResponse;
  index: number;
  selected?: boolean;
  onSelect: (place: PlaceResponse) => void;
}

function formatDistance(distance: number | null) {
  if (distance == null) return null;
  if (distance >= 1000) return `${(distance / 1000).toFixed(1)}km`;
  return `${distance}m`;
}

export default function PlaceCard({
  place,
  index,
  selected = false,
  onSelect,
}: PlaceCardProps) {
  const address = place.roadAddressName || place.addressName;
  const distance = formatDistance(place.distance);

  return (
    <article
      className={`${styles.card} ${selected ? styles.selected : ""}`}
      onClick={() => onSelect(place)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onSelect(place);
      }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
    >
      <div className={styles.index}>{index + 1}</div>
      <div className={styles.body}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <h2>{place.placeName}</h2>
            {place.categoryName && <p>{place.categoryName}</p>}
          </div>
          {distance && <span className={styles.distance}>{distance}</span>}
        </header>

        {address && (
          <div className={styles.row}>
            <MapPin aria-hidden="true" size={14} strokeWidth={2.2} />
            <span>{address}</span>
          </div>
        )}

        {place.phone && (
          <div className={styles.row}>
            <Phone aria-hidden="true" size={14} strokeWidth={2.2} />
            <span>{place.phone}</span>
          </div>
        )}

        {place.placeUrl && (
          <a
            className={styles.link}
            href={place.placeUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            <ExternalLink aria-hidden="true" size={14} strokeWidth={2.2} />
            상세 보기
          </a>
        )}
      </div>
    </article>
  );
}
