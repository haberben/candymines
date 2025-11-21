precision highp float;

uniform vec3 uBaseColor;
uniform vec3 uLightDir;
uniform vec3 uViewDir;
uniform float uRimPower;
uniform float uSpecular;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

// 4x4 Bayer matrix for ordered dithering
float bayer4x4(vec2 uv, float brightness) {
  int x = int(mod(floor(uv.x * 256.0), 4.0));
  int y = int(mod(floor(uv.y * 256.0), 4.0));
  
  int index = y * 4 + x;
  float bayerValues[16];
  bayerValues[0] = 0.0/16.0;
  bayerValues[1] = 8.0/16.0;
  bayerValues[2] = 2.0/16.0;
  bayerValues[3] = 10.0/16.0;
  bayerValues[4] = 12.0/16.0;
  bayerValues[5] = 4.0/16.0;
  bayerValues[6] = 14.0/16.0;
  bayerValues[7] = 6.0/16.0;
  bayerValues[8] = 3.0/16.0;
  bayerValues[9] = 11.0/16.0;
  bayerValues[10] = 1.0/16.0;
  bayerValues[11] = 9.0/16.0;
  bayerValues[12] = 15.0/16.0;
  bayerValues[13] = 7.0/16.0;
  bayerValues[14] = 13.0/16.0;
  bayerValues[15] = 5.0/16.0;
  
  float threshold = bayerValues[index];
  return step(threshold, brightness);
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 L = normalize(uLightDir);
  vec3 V = normalize(uViewDir - vPosition);
  
  // Diffuse lighting
  float NdotL = max(dot(N, L), 0.0);
  
  // Toon ramp (3 levels for candy style)
  float toon = NdotL;
  if (toon > 0.66) {
    toon = 1.0;
  } else if (toon > 0.33) {
    toon = 0.66;
  } else {
    toon = 0.33;
  }
  
  // Rim lighting (Fresnel effect)
  float rim = pow(1.0 - max(dot(V, N), 0.0), uRimPower);
  rim = smoothstep(0.3, 1.0, rim);
  
  // Specular highlight
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 32.0) * uSpecular;
  
  // Combine lighting
  vec3 diffuse = uBaseColor * toon;
  vec3 rimColor = vec3(1.0, 0.95, 0.85) * rim * 0.8;
  vec3 specColor = vec3(1.0) * spec;
  
  vec3 color = diffuse + rimColor + specColor;
  
  // Add subtle color variation
  color += vec3(0.02) * sin(vUv.y * 10.0 + uTime * 0.5);
  
  // Calculate luminance for dithering
  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  
  // Apply dithering
  float dither = bayer4x4(vUv, lum);
  vec3 finalColor = mix(color * 0.92, color * 1.08, dither);
  
  // Ensure colors stay vibrant
  finalColor = clamp(finalColor, 0.0, 1.0);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
