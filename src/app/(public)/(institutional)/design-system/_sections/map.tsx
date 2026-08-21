"use client";

import {
  MapControls,
  Map as MapcnMap,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";

import { ShowcaseBlock, ShowcaseSection } from "../_components/showcase";

const COOPERATIVAS = [
  { nome: "Cooperativa Vila Verde", lng: -46.633, lat: -23.55 },
  { nome: "Ecoponto Pinheiros", lng: -46.68, lat: -23.566 },
];

export function MapSection() {
  return (
    <ShowcaseSection
      id="mapa"
      title="Mapa (mapcn)"
      description="Componente de mapa baseado em MapLibre GL (mapcn.dev), com tiles CARTO gratuitos e adaptação automática a light/dark."
    >
      <ShowcaseBlock title="Map" className="p-0">
        <MapcnMap
          center={[-46.633, -23.55]}
          zoom={11}
          className="h-96 w-full overflow-hidden rounded-lg"
        >
          <MapControls showZoom showCompass />
          {COOPERATIVAS.map((c) => (
            <MapMarker key={c.nome} longitude={c.lng} latitude={c.lat}>
              <MarkerContent />
              <MarkerPopup>{c.nome}</MarkerPopup>
            </MapMarker>
          ))}
        </MapcnMap>
      </ShowcaseBlock>
    </ShowcaseSection>
  );
}
