export const SPLINE_SCENE_UPSTREAM_DEFAULT =
  "https://prod.spline.design/L85TJB7vYjXSehlK/scene.splinecode";

export function getSplineSceneUpstreamUrl(): string {
  return (
    process.env.SPLINE_SCENE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SPLINE_SCENE_URL?.trim() ||
    SPLINE_SCENE_UPSTREAM_DEFAULT
  );
}
