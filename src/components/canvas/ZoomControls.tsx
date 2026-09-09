import { Controls } from '@xyflow/react';

export function ZoomControls() {
  return (
    <Controls
      position="bottom-left"
      showZoom={true}
      showFitView={true}
      showInteractive={true}
      className="m-4"
    />
  );
}

export default ZoomControls;
