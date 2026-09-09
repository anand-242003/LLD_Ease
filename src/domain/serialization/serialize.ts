import { Diagram } from '../types';
import { CURRENT_SCHEMA_VERSION } from './migrations';

/**
 * Losslessly serializes a diagram to a JSON string.
 * Strips any derived fields (issues, generatedCode) and stamps schemaVersion.
 */
export function serialize(diagram: Diagram): string {
  const { issues, generatedCode, ...cleanDiagram } = diagram as unknown as Record<
    string,
    unknown
  >;

  const payload = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    ...cleanDiagram,
  };

  return JSON.stringify(payload, null, 2);
}
