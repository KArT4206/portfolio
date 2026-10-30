// Procedural sandstone: fractal noise lit by a low-angle light gives real
// pits and relief; two more noise passes add fine grain and large ochre
// mottling. stitchTiles makes it tile seamlessly. Browsers rasterize the
// filter once, so it costs nothing per frame.
export function stoneTextureUrl(): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='640'>
<filter id='s' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
<feTurbulence type='fractalNoise' baseFrequency='0.018' numOctaves='6' seed='7' stitchTiles='stitch' result='n'/>
<feDiffuseLighting in='n' lighting-color='#f1dcb0' surfaceScale='2.6' result='lit'><feDistantLight azimuth='235' elevation='42'/></feDiffuseLighting>
<feTurbulence type='fractalNoise' baseFrequency='0.004' numOctaves='3' seed='19' stitchTiles='stitch' result='m'/>
<feColorMatrix in='m' type='matrix' values='0 0 0 0 0.86  0 0 0 0 0.70  0 0 0 0 0.48  0 0 0 1.4 -0.35' result='mottle'/>
<feBlend in='lit' in2='mottle' mode='multiply' result='a'/>
<feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='3' stitchTiles='stitch' result='g'/>
<feColorMatrix in='g' type='matrix' values='0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.25  0 0 0 0.55 0' result='grain'/>
<feBlend in='grain' in2='a' mode='multiply'/>
</filter>
<rect width='100%' height='100%' filter='url(#s)'/>
</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
