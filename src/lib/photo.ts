import { randomUUID } from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/**
 * Fotoverarbeitung vor dem Speichern: Kopf abschneiden (Schnitt an der Schulterlinie der Pose-Anleitung),
 * auf höchstens 1080 px Breite verkleinern, als JPEG speichern. Alles lokal, deterministisch, ohne Gesichtserkennung.
 *
 * Die Kameravorschau ist 3:4 (Breite:Höhe) und das Bild wird im selben Verhältnis aufgenommen, deshalb entspricht
 * SHOULDER_LINE_RATIO im Bild derselben Höhe wie in der Vorschau.
 */
export const PREVIEW_ASPECT = 3 / 4;
export const SHOULDER_LINE_RATIO = 0.2;
export const MAX_WIDTH = 1080;

export type ProcessedPhoto = { uri: string; width: number; height: number };

function photoDir(): Directory {
  const dir = new Directory(Paths.document, 'checkins');
  if (!dir.exists) dir.create();
  return dir;
}

export async function processCapture(
  uri: string,
  width: number,
  height: number,
  options: { maskHead: boolean },
): Promise<ProcessedPhoto> {
  const ctx = ImageManipulator.manipulate(uri);
  let w = width;
  let h = height;
  if (options.maskHead) {
    const top = Math.round(height * SHOULDER_LINE_RATIO);
    ctx.crop({ originX: 0, originY: top, width, height: height - top });
    h = height - top;
  }
  if (w > MAX_WIDTH) {
    const scale = MAX_WIDTH / w;
    ctx.resize({ width: MAX_WIDTH, height: Math.round(h * scale) });
    w = MAX_WIDTH;
    h = Math.round(h * scale);
  }
  const rendered = await ctx.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.82 });

  const dest = new File(photoDir(), `${randomUUID()}.jpg`);
  const tmp = new File(saved.uri);
  tmp.move(dest);
  return { uri: dest.uri, width: saved.width || w, height: saved.height || h };
}

export function deleteLocalPhoto(uri: string | null): void {
  if (!uri) return;
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // Datei fehlt bereits
  }
}

export function deleteAllLocalPhotos(): void {
  try {
    const dir = new Directory(Paths.document, 'checkins');
    if (dir.exists) dir.delete();
  } catch {
    // nichts zu löschen
  }
}
