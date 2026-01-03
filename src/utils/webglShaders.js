/**
 * WebGL шейдеры для фонов
 * Адаптированы из ShaderToy формата для WebGL
 */

// Вершинный шейдер (общий для всех)
const VERTEX_SHADER = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Фрагментные шейдеры для каждого фона
const FRAGMENT_SHADERS = {
  "tlVGDt": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv = uv * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;
  
  float t = u_time * 0.5;
  vec3 col = vec3(0.0);
  
  for (float i = 0.0; i < 3.0; i++) {
    float d = length(uv - vec2(sin(t + i * 2.0), cos(t + i * 2.0)) * 0.3);
    col += vec3(0.3, 0.5, 0.8) / (1.0 + d * 10.0);
  }
  
  gl_FragColor = vec4(col, 1.0);
}
`,
  "3l23Rh": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  
  float t = u_time * 1.2;
  vec3 col = vec3(0.0);
  
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    vec2 p = vec2(sin(t * 0.8 + fi * 0.8), cos(t * 0.6 + fi * 0.6)) * (0.4 + sin(t * 0.3) * 0.1);
    float d = length(uv - p);
    float pulse = sin(d * 8.0 - t * 2.0) * 0.3 + 0.7;
    col += vec3(0.8, 0.4, 0.6) * pulse * 0.15 / (d * d + 0.1);
  }
  
  col = pow(col, vec3(0.9));
  gl_FragColor = vec4(col, 1.0);
}
`,
  "XlfGRj": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv = uv * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;
  
  float t = u_time;
  vec3 col = vec3(0.1, 0.1, 0.2);
  
  for (float i = 0.0; i < 5.0; i++) {
    vec2 p = vec2(sin(t + i * 1.2), cos(t * 0.7 + i * 1.5)) * 0.5;
    float d = length(uv - p);
    col += vec3(0.2, 0.6, 0.9) * 0.15 / (d * d * 2.0 + 0.1);
  }
  
  gl_FragColor = vec4(col, 1.0);
}
`,
  "MdX3zr": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  
  float t = u_time * 0.8;
  vec3 col = vec3(0.05, 0.05, 0.1);
  
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec2 p = vec2(sin(t + fi * 1.0), cos(t * 0.6 + fi * 1.2)) * 0.6;
    float d = length(uv - p);
    float wave = sin(d * 10.0 - t * 3.0) * 0.5 + 0.5;
    col += vec3(0.9, 0.3, 0.5) * wave * 0.1 / (d + 0.2);
  }
  
  gl_FragColor = vec4(col, 1.0);
}
`,
  "mtyGWy": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv = uv * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;
  
  float t = u_time;
  vec3 col = vec3(0.0);
  
  for (float i = 0.0; i < 4.0; i++) {
    vec2 p = vec2(sin(t * 0.4 + i * 2.0), cos(t * 0.5 + i * 2.5)) * 0.4;
    float d = length(uv - p);
    col += vec3(0.4, 0.8, 0.9) / (1.0 + d * 8.0);
  }
  
  col = pow(col, vec3(0.8));
  gl_FragColor = vec4(col, 1.0);
}
`,
  "3sySRK": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  
  float t = u_time * 1.5;
  vec3 col = vec3(0.0, 0.0, 0.1);
  
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    vec2 p = vec2(sin(t * 0.5 + fi * 0.9), cos(t * 0.6 + fi * 1.1)) * (0.5 + cos(t * 0.4 + fi) * 0.15);
    float d = length(uv - p);
    float wave = sin(d * 12.0 - t * 3.0) * 0.4 + 0.6;
    col += vec3(0.7, 0.4, 0.9) * wave * 0.15 / (d * d * 1.5 + 0.15);
  }
  
  col = pow(col, vec3(0.85));
  gl_FragColor = vec4(col, 1.0);
}
`,
  "3ftcW4": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Shader by Frostbyte
// Licensed under CC BY-NC-SA 4.0
vec4 frostbyte(vec2 u) {
  vec2 uv = (u * 2.0 - u_resolution.xy) / u_resolution.y + vec2(-1.68, 0.9);
  float v = 50.0 * length(max(abs(uv) - 0.05, 0.0));
  float f = min(v, 1.0 - v) * 2.0 * fract(atan(uv.y + 1e-6, uv.x + 1e-6) / 3.141592 - u_time * 0.3);
  return clamp(vec4(f * 1.8, f * 0.2, f * 0.1, f), 0.0, 1.0);
}

#define P(z) vec3(0.0, sin(z * 0.05) * 0.1, z)

// https://www.stevenfrady.com/tools/palette?p=[[0.8,0.79,0.89],[0.79,0.01,0.22],[0.89,0,0.55],[0.47,0.9,0.83]]
vec3 palette(float t) {
  vec3 a = vec3(0.8, 0.79, 0.89);
  vec3 b = vec3(0.79, 0.01, 0.22);
  vec3 c = vec3(0.89, 0.0, 0.55);
  vec3 d = vec3(0.47, 0.9, 0.83);
  return a + b * cos(6.28318 * (c * t + d));
}

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}

// Box
float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float map(vec3 p) {
  vec3 q = p;
  q = fract(p) - 0.5;
  
  float verBeam = sdBox(q, vec3(0.03, 0.5, 0.03));
  float horBeam = sdBox(q, vec3(0.5, 0.05, 0.03));
  float zBeam = sdBox(q, vec3(0.03, 0.03, 0.5));
  float centralCube = sdBox(q, vec3(0.15, 0.15, 0.15));
  
  return min(verBeam, min(horBeam, zBeam));
}

void main() {
  vec4 O = vec4(0.0); // initialize output color
  
  vec3 p, ro, r = u_resolution.xyx;
  float z = 0.0;
  float d = 0.01; // Initialize d
  vec2 C = gl_FragCoord.xy;
  
  for (float i = 1.0; i < 100.0; i += 1.0) {
    z += 0.4 * d;
    ro = P(u_time); // Camera origin moving along a curve
    p = ro + z * normalize(vec3(C - 0.5 * r.xy, r.y));
    p.z += u_time * 1.5;
    p.xy *= rot(p.z * 0.2 - 0.9 * smoothstep(-1.0, 1.0, sin(p.z * 0.01)));
    d = abs(map(p)) + 0.0001;
    d += abs(sin(p.z + p.y + u_time) * 0.01 + 0.001); // Sin wave for moving reflect or shine look
    // Front-to-back compositing:
    O.rgb += (4.0 - d) * (palette(d * 0.1 + 3.0) / (d));
  }
  // tanh не поддерживается в WebGL 1.0, используем аппроксимацию
  // tanh(x) ≈ x / (1.0 + abs(x)) для больших значений
  vec3 rgbSq = O.rgb * O.rgb / 1e10;
  O.rgb = sqrt(vec3(
    rgbSq.x / (1.0 + abs(rgbSq.x)),
    rgbSq.y / (1.0 + abs(rgbSq.y)),
    rgbSq.z / (1.0 + abs(rgbSq.z))
  ));
  O += frostbyte(C);
  
  gl_FragColor = O;
}
`,
  "mtyGWy": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

//https://iquilezles.org/articles/palettes/
vec3 palette( float t ) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263,0.416,0.557);

    return a + b*cos( 6.28318*(c*t+d) );
}

//https://www.shadertoy.com/view/mtyGWy
void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
    vec2 uv0 = uv;
    vec3 finalColor = vec3(0.0);
    
    for (float i = 0.0; i < 4.0; i++) {
        uv = fract(uv * 1.5) - 0.5;

        float d = length(uv) * exp(-length(uv0));

        vec3 col = palette(length(uv0) + i*.4 + u_time*.4);

        d = sin(d*8. + u_time)/8.;
        d = abs(d);

        d = pow(0.01 / d, 1.2);

        finalColor += col * d;
    }
        
    gl_FragColor = vec4(finalColor, 1.0);
}
`,
  "bumpedWarp": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Warp function. Variations have been around for years. This is
// almost the same as Fabrice's version:
// Fabrice - Plop 2
// https://www.shadertoy.com/view/MlSSDV
vec2 W(vec2 p){
    
    p = (p + 3.)*4.;

    float t = u_time/2.;

    // Layered, sinusoidal feedback, with time component.
    for (int i=0; i<3; i++){
        p += cos(p.yx*3. + vec2(t, 1.57))/3.;
        p += sin(p.yx + t + vec2(1.57, 0))/2.;
        p *= 1.3;
    }

    // A bit of jitter to counter the high frequency sections.
    p +=  fract(sin(p+vec2(13., 7.))*5e5)*.03 - .015;

    return mod(p, 2.) - 1.; // Range: [vec2(-1), vec2(1)]
    
}

// Bump mapping function. Put whatever you want here. In this case, 
// we're returning the length of the sinusoidal warp function.
float bumpFunc(vec2 p){ 

	return length(W(p))*.7071; // Range: [0, 1]

}

vec3 smoothFract(vec3 x){ x = fract(x); return min(x, x*(1.-x)*12.); }

void main(){

    // Screen coordinates.
	vec2 uv = (gl_FragCoord.xy - u_resolution.xy*.5)/u_resolution.y;
    
    // VECTOR SETUP - surface postion, ray origin, unit direction vector, and light postion.
    vec3 sp = vec3(uv, 0.); // Surface position. Hit point, if you prefer. Essentially, a screen at the origin.
    vec3 rd = normalize(vec3(uv, 1.)); // Unit direction vector. From the origin to the screen plane.
    vec3 lp = vec3(cos(u_time)*.5, sin(u_time)*.2, -1.); // Light position - Back from the screen.
	vec3 sn = vec3(0., 0., -1.); // Plane normal. Z pointing toward the viewer.
    
    // BUMP MAPPING - PERTURBING THE NORMAL
    vec2 eps = vec2(4./u_resolution.y, 0.);
    
    float f = bumpFunc(sp.xy); // Sample value multiplied by the amplitude.
    float fx = bumpFunc(sp.xy - eps.xy); // Same for the nearby sample in the X-direction.
    float fy = bumpFunc(sp.xy - eps.yx); // Same for the nearby sample in the Y-direction.
   
 	// Controls how much the bump is accentuated.
	const float bumpFactor = .05;
    
    // Using the above to determine the dx and dy function gradients.
    fx = (fx - f)/eps.x; // Change in X
    fy = (fy - f)/eps.x; // Change in Y.
    sn = normalize(sn + vec3(fx, fy, 0.)*bumpFactor);   
   
    // LIGHTING
	// Determine the light direction vector, calculate its distance, then normalize it.
	vec3 ld = lp - sp;
	float lDist = max(length(ld), .0001);
	ld /= lDist;

    // Light attenuation.    
    float atten = 1./(1. + lDist*lDist*.15);
    
    // Using the bump function, "f," to darken the crevices. Completely optional, but I
    // find it gives extra depth.
    atten *= f*.9 + .1;

	// Diffuse value.
	float diff = max(dot(sn, ld), 0.);  
    // Enhancing the diffuse value a bit. Made up.
    diff = pow(diff, 4.)*.66 + pow(diff, 8.)*.34; 
    // Specular highlighting.
    float spec = pow(max(dot( reflect(-ld, sn), -rd), 0.), 12.); 
    
    // TEXTURE COLOR
    // Using procedural texture instead of iChannel0
    vec3 texCol = smoothFract( W(sp.xy).xyy )*.1 + .2;
    // A bit of color processing.
    texCol = smoothstep(.05, .75, pow(texCol, vec3(.75, .8, .85)));    
    
    // FINAL COLOR
    // Using the values above to produce the final color.   
    vec3 col = (texCol*(diff*vec3(1., .97, .92)*2. + .5) + vec3(1., .6, .2)*spec*2.)*atten;
    
    // Faux environment mapping: I added this in at a later date out of sheer boredome, and  
    // because I like shiny stuff. You can comment it out if it's not to your liking. :)
    float ref = max(dot(reflect(rd, sn), vec3(1.)), 0.);
    col += col*pow(ref, 4.)*vec3(.25, .5, 1.)*3.;
    

    // Perform some statistically unlikely (but close enough) 2.0 gamma correction. :) 
	gl_FragColor = vec4(sqrt(clamp(col, 0., 1.)), 1.);
}
`,
  "quadTree2026": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define Rot(a) mat2(cos(a),-sin(a),sin(a),cos(a))
#define antialiasing(n) n/min(u_resolution.y,u_resolution.x)
#define S(d) 1.-smoothstep(-1.3,1.3, (d)*u_resolution.y )
#define B(p,s) max(abs(p).x-s.x,abs(p).y-s.y)
#define PI 3.1415
#define FONT_H 0.017
#define FONT_THICK 0.005

float random (vec2 p) {
    return fract(sin(dot(p.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

float lineTo(vec2 p, vec2 a, vec2 b, float t){
    float k = dot(p-a,b-a)/dot(b-a,b-a);
    return mix(distance(p,mix(a,b,clamp(k,0.,t))),1e5, step(t,0.01));
}

// thx, iq! https://iquilezles.org/articles/distfunctions2d/
float dot2( vec2 v ) { return dot(v,v); }
float sdBezier( in vec2 pos, in vec2 A, in vec2 B, in vec2 C, float t )
{    
    vec2 a = B - A;
    vec2 b = A - 2.0*B + C;
    vec2 c = a * 2.0;
    vec2 d = A - pos;
    float kk = 1.0/dot(b,b);
    float kx = kk * dot(a,b);
    float ky = kk * (2.0*dot(a,a)+dot(d,b)) / 3.0;
    float kz = kk * dot(d,a);      
    float res = 0.0;
    float p = ky - kx*kx;
    float p3 = p*p*p;
    float q = kx*(2.0*kx*kx-3.0*ky) + kz;
    float h = q*q + 4.0*p3;
    if( h >= 0.0) 
    { 
        h = sqrt(h);
        vec2 x = (vec2(h,-h)-q)/2.0;
        vec2 uv = sign(x)*pow(abs(x), vec2(1.0/3.0));
        float t = clamp( uv.x+uv.y-kx, 0.0, t );
        res = dot2(d + (c + b*t)*t);
    }
    else
    {
        float z = sqrt(-p);
        float v = acos( q/(p*z*2.0) ) / 3.0;
        float m = cos(v);
        float n = sin(v)*1.732050808;
        vec3  t = clamp(vec3(m+m,-n-m,n-m)*z-kx,0.0,t);
        res = min( dot2(d+(c+b*t.x)*t.x),
                   dot2(d+(c+b*t.y)*t.y) );
    }
    return mix(sqrt( res ),1e5, step(t,0.01));
}

float cL(vec2 p){
    vec2 prevP = p;
    float h = FONT_H;
    float d = lineTo(p,vec2(-h,h),vec2(-h,-h),1.)-FONT_THICK;
    float d2 = lineTo(p,vec2(-h,-h),vec2(h,-h),1.)-FONT_THICK;
    d = min(d,d2);
    return d;
}

float cP(vec2 p){
    float h = FONT_H;
    float d = lineTo(p,vec2(-h,0.0),vec2(-h,-h),1.)-FONT_THICK;
    float d2 = lineTo(p,vec2(-h,h),vec2(h,h),1.)-FONT_THICK;
    d = min(d,d2);
    float d3 = lineTo(p,vec2(-h,0.),vec2(h,0.),1.)-FONT_THICK;
    d = min(d,d3);
    float d4 = lineTo(p,vec2(h,h),vec2(h,0.),1.)-FONT_THICK;
    d = min(d,d4);
    return d;
}

float c0(vec2 p){
    vec2 prevP = p;
    float h = FONT_H;
    p.x = abs(p.x);
    float d = lineTo(p,vec2(h,h),vec2(h,-h),1.)-FONT_THICK;
    p = prevP;
    p.y = abs(p.y);
    float d2 = lineTo(p,vec2(h,h),vec2(-h,h),1.)-FONT_THICK;
    d = min(d,d2);
    return d;
}

float c1(vec2 p){
    vec2 prevP = p;
    float h = FONT_H;
    float d = lineTo(p,vec2(0.,h),vec2(0.,-h),1.)-FONT_THICK;
    return d;
}

float c2(vec2 p){
    vec2 prevP = p;
    float h = FONT_H;
    p.y = abs(p.y);
    float d = lineTo(p,vec2(h,h),vec2(-h,h),1.)-FONT_THICK;
    p = prevP;
    float d2 = lineTo(p,vec2(h,0.),vec2(-h,0.),1.)-FONT_THICK;
    d = min(d,d2);
    float d3 = lineTo(p,vec2(h,h),vec2(h,0.),1.)-FONT_THICK;
    d = min(d,d3);
    float d4 = lineTo(p,vec2(-h,0.),vec2(-h,-h),1.)-FONT_THICK;
    d = min(d,d4);
    return d;
}

float c3(vec2 p){
    vec2 prevP = p;
    float h = FONT_H;
    p.y = abs(p.y);
    float d = lineTo(p,vec2(h,h),vec2(-h,h),1.)-FONT_THICK;
    p = prevP;
    float d2 = lineTo(p,vec2(h*0.25,0.),vec2(-h,0.),1.)-FONT_THICK;
    d = min(d,d2);
    float d3 = lineTo(p,vec2(h,h),vec2(h,-h),1.)-FONT_THICK;
    d = min(d,d3);
    return d;
}

float c4(vec2 p){
    float h = FONT_H;
    float d = lineTo(p,vec2(-h,h),vec2(-h,0.0),1.)-FONT_THICK;
    float d2 = lineTo(p,vec2(h,0.0),vec2(-h,0.0),1.)-FONT_THICK;
    d = min(d,d2);
    float d3 = lineTo(p,vec2(h,0.0),vec2(h,-h),1.)-FONT_THICK;
    d = min(d,d3);
    float d4 = lineTo(p,vec2(h,h),vec2(h,h*0.75),1.)-FONT_THICK;
    d = min(d,d4);
    return d;
}

float c5(vec2 p){
    vec2 prevP = p;
    p.y*=-1.;
    float d = c2(p);
    return d;
}

float c6(vec2 p){
    vec2 prevP = p;
    p.y*=-1.;
    float d = cP(p);
    return d;
}

float c7(vec2 p){
    vec2 prevP = p;
    p*=-1.;
    float d = cL(p);
    return d;
}

float c8(vec2 p){
    vec2 prevP = p;
    float h = FONT_H;
    float d = c0(p);
    float d2 = lineTo(p,vec2(-h,0.),vec2(h,0.0),1.)-FONT_THICK;
    d = min(d,d2);
    return d;
}

float c9(vec2 p){
    vec2 prevP = p;
    p.x*=-1.;
    float d = cP(p);
    return d;
}

float drawNumber(vec2 p, int char){
    float d = 10.;
    if(char == 0) {
        d = c0(p);
    } else if(char == 1){
        d = c1(p);
    } else if(char == 2){
        d = c2(p);
    } else if(char == 3){
        d = c3(p);
    } else if(char == 4){
        d = c4(p);
    } else if(char == 5){
        d = c5(p);
    } else if(char == 6){
        d = c6(p);
    } else if(char == 7){
        d = c7(p);
    } else if(char == 8){
        d = c8(p);
    } else if(char == 9){
        d = c9(p);
    }
    
    return d;
}

float cubicInOut(float t) {
  return t < 0.5
    ? 4.0 * t * t * t
    : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
}

float linesLayer1(vec2 p, float anim, float speed, float thick){
    float num = 7.0;
    float t = mod(u_time*speed,num);
    if(t<num*0.3){
        t = cubicInOut(t);
    } else {
        t = (num-1.)-cubicInOut((t*0.7)-(num*0.3));
    }
    t = mix(num,t,anim);
    
    float d = lineTo(p,vec2(-0.1851,0.0842),vec2(-0.2210,0.1274),clamp(t,0.,1.))-thick;
    float d2 = lineTo(p,vec2(-0.2210,0.1274),vec2(-0.0657,0.1654),clamp(t-1.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.0657,0.1654),vec2(-0.2523,-0.0546),clamp(t-2.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.2523,-0.0546),vec2(-0.0986,-0.0150),clamp(t-3.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.0986,-0.0150),vec2(-0.1182,0.0230),clamp(t-4.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.1182,0.0230),vec2(-0.1182,0.0230),clamp(t-5.,0.,1.))-thick;
    d = min(d,d2);
    return d;
}

float linesLayer2(vec2 p, float anim, float speed, float thick){
    float num = 7.0;
    float t = mod(u_time*speed,num);
    if(t<num*0.3){
        t = cubicInOut(t);
    } else {
        t = (num-1.)-cubicInOut((t*0.7)-(num*0.3));
    }
    t = mix(num,t,anim);
    
    float d = lineTo(p,vec2(-0.0677,0.0360),vec2(-0.0911,0.0864),clamp(t,0.,1.))-thick;
    float d2 = lineTo(p,vec2(-0.0911,0.0864),vec2(-0.0391,0.1612),clamp(t-1.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.0391,0.1612),vec2(-0.0052,0.0780),clamp(t-2.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.0052,0.0780),vec2(-0.0589,-0.0468),clamp(t-3.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.0589,-0.0468),vec2(-0.1007,0.0222),clamp(t-4.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.1007,0.0222),vec2(-0.0911,0.0572),clamp(t-5.,0.,1.))-thick;
    d = min(d,d2);
    return d;
}

float linesLayer3(vec2 p, float anim, float speed, float thick){
    float num = 7.0;
    float t = mod(u_time*speed,num);
    if(t<num*0.3){
        t = cubicInOut(t);
    } else {
        t = (num-1.)-cubicInOut((t*0.7)-(num*0.3));
    }
    t = mix(num,t,anim);
    
    float d = lineTo(p,vec2(0.0156,0.0820),vec2(-0.0052,0.1168),clamp(t,0.,1.))-thick;
    float d2 = lineTo(p,vec2(-0.0052,0.1168),vec2(0.1250,0.1728),clamp(t-1.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(0.1250,0.1728),vec2(-0.0299,-0.0340),clamp(t-2.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.0299,-0.0340),vec2(0.0755,-0.0158),clamp(t-3.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(0.0755,-0.0158),vec2(0.0475,0.0102),clamp(t-4.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(0.0475,0.0102),vec2(0.0475,0.0102),clamp(t-5.,0.,1.))-thick;
    d = min(d,d2);
    return d;
}

float linesLayer4(vec2 p, float anim, float speed, float thick){
    float num = 7.0;
    float t = mod(u_time*speed,num);
    if(t<num*0.3){
        t = cubicInOut(t);
    } else {
        t = (num-1.)-cubicInOut((t*0.7)-(num*0.3));
    }
    t = mix(num,t,anim);
    
    float d = lineTo(p,vec2(0.1396,0.0890),vec2(0.1484,0.1612),clamp(t,0.,1.))-thick;
    float d2 = lineTo(p,vec2(0.1484,0.1612),vec2(0.0716,0.0244),clamp(t-1.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(0.0716,0.0244),vec2(0.1783,-0.0456),clamp(t-2.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(0.1783,-0.0456),vec2(0.2411,0.0848),clamp(t-3.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(0.2411,0.0848),vec2(0.1042,0.0340),clamp(t-4.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(0.1042,0.0340),vec2(0.1042,0.0340),clamp(t-5.,0.,1.))-thick;
    d = min(d,d2);
    return d;
}

float draw2026_items(vec2 p, float t, float thick){
    float d = sdBezier(p,vec2(0.15,-0.08),vec2(0.0,-0.035),vec2(-0.2,-0.09),t)-thick;
    float d2 = sdBezier(p,vec2(0.25,-0.13),vec2(0.0,-0.03),vec2(-0.25,-0.13),t)-thick;
    d = min(d,d2);
    float d3 = lineTo(p,vec2(0.03,-0.11),vec2(-0.07,-0.12),t)-thick;
    d = min(d,d3);
    
    float d4 = lineTo(p,vec2(0.2,0.18),vec2(0.17,0.12),t)-thick;
    d = min(d,d4);
    float d5 = lineTo(p,vec2(0.1,0.19),vec2(0.0,0.14),t)-thick;
    d = min(d,d5);  
    float d6 = lineTo(p,vec2(0.1,-0.03),vec2(0.21,-0.09),t)-thick;
    d = min(d,d6);      
    float d7 = lineTo(p,vec2(-0.27,0.14),vec2(-0.21,0.08),t)-thick;
    d = min(d,d7);    
    float d8 = lineTo(p,vec2(-0.3,-0.05),vec2(-0.21,0.03),t)-thick;
    d = min(d,d8); 
    return d;
}

float draw2026_bg(vec2 p){
    float d = linesLayer1(p,0.0,0.0,0.007);
    float d2 = linesLayer2(p,0.0,0.0,0.007);
    d = min(d,d2);
    float d3 = linesLayer3(p,0.0,0.0,0.007);
    d = min(d,d3);
    float d4 = linesLayer4(p,0.0,0.0,0.007);
    d = min(d,d4);
    float thick = 0.007;
    float d5 = draw2026_items(p,1.0,thick);
    d = min(d,d5);      
    
    return d;
}

float draw2026(vec2 p, float speed){
    float d = linesLayer1(p,1.0,speed,0.007);
    float d2 = linesLayer2(p,1.0,speed,0.007);
    d = min(d,d2);
    float d3 = linesLayer3(p,1.0,speed,0.007);
    d = min(d,d3);
    float d4 = linesLayer4(p,1.0,speed,0.007);
    d = min(d,d4);
    float thick = 0.007;
    float num = 7.;
    float t = mod(u_time*speed,num);
    if(t<num*0.3){
        t = cubicInOut(t);
    } else {
        t = (num-1.)-cubicInOut((t*0.7)-(num*0.3));
    }
    
    float d5 = draw2026_items(p,clamp(t,0.,1.0),thick);
    d = min(d,d5);     
    
    return d;
}

float drawStarBg(vec2 p){
    float d = lineTo(p,vec2(-0.18,-0.15),vec2(0.0,0.2),1.)-0.015;
    float d2 = lineTo(p,vec2(0.0,0.2),vec2(0.2,-0.2),1.)-0.015;
    d = min(d,d2);
    float d3 = lineTo(p,vec2(0.2,-0.2),vec2(-0.25,0.1),1.)-0.015;
    d = min(d,d3);
    float d4 = lineTo(p,vec2(-0.25,0.1),vec2(0.25,0.0),1.)-0.015;
    d = min(d,d4);
    float d5 = lineTo(p,vec2(0.25,0.0),vec2(-0.18,-0.15),1.)-0.015;
    d = min(d,d5);
    return d;
}

float drawStar(vec2 p, float speed){
    float num = 7.;
    float t = mod(u_time*speed,num);
    if(t<num*0.3){
        t = cubicInOut(t);
    } else {
        t = (num-1.)-cubicInOut((t*0.7)-(num*0.3));
    }
    t = clamp(t,0.,1.);
    
    float d = lineTo(p,vec2(-0.18,-0.15),vec2(0.0,0.2),t)-0.015;
    float d2 = lineTo(p,vec2(0.0,0.2),vec2(0.2,-0.2),clamp(t-1.,0.,1.))-0.015;
    d = min(d,d2);
    float d3 = lineTo(p,vec2(0.2,-0.2),vec2(-0.25,0.1),clamp(t-2.,0.,1.))-0.015;
    d = min(d,d3);
    float d4 = lineTo(p,vec2(-0.25,0.1),vec2(0.25,0.0),clamp(t-3.,0.,1.))-0.015;
    d = min(d,d4);
    float d5 = lineTo(p,vec2(0.25,0.0),vec2(-0.18,-0.15),clamp(t-4.,0.,1.))-0.015;
    d = min(d,d5);
    return d;
}

float drawCircleBg(vec2 p){
    float thick = 0.01;
    float d = sdBezier(p,vec2(-0.07,0.05),vec2(-0.2,0.0),vec2(-0.08,-0.05),1.)-thick;
    float d2 = sdBezier(p,vec2(0.08,-0.05),vec2(0.2,0.0),vec2(-0.01,0.05),1.)-thick;
    d = min(d,d2);
    float d3 = sdBezier(p,vec2(-0.08,-0.05),vec2(0.01,-0.07),vec2(0.08,-0.05),1.)-thick;
    d = min(d,d3);
    return d;
}

float drawCircle(vec2 p, float speed){
    float thick = 0.01;
    
    float num = 7.;
    float t = mod(u_time*speed,num);
    if(t<num*0.3){
        t = cubicInOut(t);
    } else {
        t = (num-1.)-cubicInOut((t*0.7)-(num*0.3));
    }    
    
    float d = sdBezier(p,vec2(-0.07,0.05),vec2(-0.2,0.0),vec2(-0.08,-0.05),clamp(t,0.,1.0))-thick;
    float d2 = sdBezier(p,vec2(0.08,-0.05),vec2(0.2,0.0),vec2(-0.01,0.05),clamp(t-2.,0.,1.0))-thick;
    d = min(d,d2);
    float d3 = sdBezier(p,vec2(-0.08,-0.05),vec2(0.01,-0.07),vec2(0.08,-0.05),clamp(t-1.,0.,1.0))-thick;
    d = min(d,d3);
    return d;
}

float drawNumbersText(vec2 p, float n){
    p-=vec2(0.42,-0.42);

    float d = drawNumber(p,int(mod(10.*u_time+n,10.)));
    p.x-=-0.05;
    float d2 = drawNumber(p,int(mod(5.*u_time+n,10.)));
    d = min(d,d2);
    p.x-=-0.05;
    float d3 = drawNumber(p,int(mod(3.*u_time+n,10.)));
    d = min(d,d3);
    return d;
}

vec3 quadTree(vec2 p, vec3 col){
    p.y-=u_time*0.1;
    p*=2.;
    vec2 id = floor(p);
    vec2 gr = (p-id)-0.5;
    
    float n = random(id);
    float n2 = random(id)*10.;
    int type = 0;
    vec2 cell = id;

    // Заменяем массив на отдельные переменные для WebGL 1.0
    float threshold0 = 0.6;
    float threshold1 = 0.6;
    float threshold2 = 0.5;

    for (int i = 0; i < 3; i++)
    {
        n = random(cell + id + float(i) * 12.34);
        
        float threshold = 0.6;
        if (i == 0) threshold = threshold0;
        else if (i == 1) threshold = threshold1;
        else if (i == 2) threshold = threshold2;

        if (n < threshold)
            break;

        type = i + 1;
        
        if(i<2){
            gr *= 2.0;
            cell = floor(gr);
            gr = fract(gr) - 0.5;
        }
    }

    float d;
    vec2 prevGr = gr;
    if (type <= 1)
    {
        gr*=0.65;
        gr.x -=0.03;
        gr.y +=0.03;
        d = draw2026_bg(gr);
        col = mix(col,vec3(0.4),S(d));
        d = draw2026(gr,((n*0.5)+0.5));
        col = mix(col,vec3(1.),S(d));
        gr = prevGr;
        
        d = abs(B(gr,vec2(0.47)))-0.002;
        d = max(-(abs(gr.x)-0.4),d);
        d = max(-(abs(gr.y)-0.4),d);
        col = mix(col,vec3(1.),S(d));        
        
        gr = prevGr;
        d = abs(B(gr,vec2(0.47)))-0.006;
        gr*=Rot(radians(30.*u_time+(n*10.0)));
        d = max(-(abs(gr.x)-0.2),d);
        d = max(-(abs(gr.y)-0.2),d);
        col = mix(col,vec3(0.5),S(d));
        
        gr = prevGr;
        d = drawNumbersText(gr,n2);
        col = mix(col,vec3(0.8),S(d));
    }
    else if (type == 2)
    {
         gr*=0.7;
         d = drawStarBg(gr);
         col = mix(col,vec3(0.4),S(d));
         d = drawStar(gr,((n*0.5)+0.5));
         col = mix(col,vec3(1.),S(d));
    }
    else
    {
         gr*=0.35;
         d = drawCircleBg(gr);
         col = mix(col,vec3(0.4),S(d));
         d = drawCircle(gr,((n*0.5)+0.5));
         col = mix(col,vec3(1.),S(d)); 
    }
    
    if(type >= 2){
         gr = prevGr;
         d = abs(B(gr,vec2(0.44)))-0.005;
         d = max(-(abs(gr.x)-0.3),d);
         d = max(-(abs(gr.y)-0.3),d);
         col = mix(col,vec3(1.),S(d));  
         
         gr.x+=0.33;
         gr.y-=0.33;
         gr*=0.6;
         d = drawNumbersText(gr,n2);
         col = mix(col,vec3(0.8),S(d));
    }
    
    return col;
}

vec3 bg(vec2 p, vec3 col){
    vec2 prevP = p;
    p.y-=u_time*0.12;
    
    p = mod(p,0.05)-0.025;
    float d = length(p)-0.001;
    col = mix(col,vec3(1.),S(d));
    
    p = prevP;
    p.y-=u_time*0.135;
    vec2 id = floor(p*70.);
    col = mix(col,vec3(0.25),step(0.98, random(id)));
    
    return col;
}

vec2 getSphereMap(vec2 p, float size){
    p*=size;
    float r = dot(p, p);
    float z = sqrt(1.0 - r);
    vec3 q = vec3(p, z);
    q.xz*=Rot(radians(53.+20.*u_time*0.5));
    vec3 normal = normalize(q);

    float longitude = atan(normal.x, normal.z);
    float latitude  = asin(normal.y);

    float u = longitude / (2. * PI) + 0.5;
    float v = latitude / (2.*PI) + 0.5;

    p = vec2(u,v);
    p -= 0.5;
    p*=size;
    return p;
}

float getTime(float t, float duration){
    return clamp(t,0.0,duration)/duration;
}

float getAnimationValue(){
    float easeValue = 0.;
    float frame = mod(u_time,12.0);
    float time = frame;
    
    float duration = 1.;
    if(frame>=5. && frame<6.){
        time = getTime(time-5.,duration);
        easeValue = cubicInOut(time);
    } else if(frame>=6. && frame<11.){
        easeValue = 1.;
    } else if(frame>=11. && frame<12.){
        time = getTime(time-11.,duration);
        easeValue = 1.0-cubicInOut(time);
    }
    
    return easeValue;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy-0.5*u_resolution.xy)/u_resolution.y;
    uv*=1.-(getAnimationValue()*0.3);
    vec3 col = vec3(0.);
    
    col = bg(uv,col);
    col = quadTree(uv,col);

    gl_FragColor = vec4(col,1.0);
}
`,
  "octgrams": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

float gTime = 0.;
const float REPEAT = 5.0;

// 回転行列
mat2 rot(float a) {
	float c = cos(a), s = sin(a);
	return mat2(c,s,-s,c);
}

float sdBox( vec3 p, vec3 b )
{
	vec3 q = abs(p) - b;
	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float box(vec3 pos, float scale) {
	pos *= scale;
	float base = sdBox(pos, vec3(.4,.4,.1)) /1.5;
	pos.xy *= 5.;
	pos.y -= 3.5;
	pos.xy *= rot(.75);
	float result = -base;
	return result;
}

float box_set(vec3 pos, float iTime) {
	vec3 pos_origin = pos;
	pos = pos_origin;
	pos .y += sin(gTime * 0.4) * 2.5;
	pos.xy *=   rot(.8);
	float box1 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
	pos = pos_origin;
	pos .y -=sin(gTime * 0.4) * 2.5;
	pos.xy *=   rot(.8);
	float box2 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
	pos = pos_origin;
	pos .x +=sin(gTime * 0.4) * 2.5;
	pos.xy *=   rot(.8);
	float box3 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);	
	pos = pos_origin;
	pos .x -=sin(gTime * 0.4) * 2.5;
	pos.xy *=   rot(.8);
	float box4 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);	
	pos = pos_origin;
	pos.xy *=   rot(.8);
	float box5 = box(pos,.5) * 6.;	
	pos = pos_origin;
	float box6 = box(pos,.5) * 6.;	
	float result = max(max(max(max(max(box1,box2),box3),box4),box5),box6);
	return result;
}

float map(vec3 pos, float iTime) {
	vec3 pos_origin = pos;
	float box_set1 = box_set(pos, iTime);

	return box_set1;
}

void main() {
	vec2 p = (gl_FragCoord.xy * 2. - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
	vec3 ro = vec3(0., -0.2 ,u_time * 4.);
	vec3 ray = normalize(vec3(p, 1.5));
	ray.xy = ray.xy * rot(sin(u_time * .03) * 5.);
	ray.yz = ray.yz * rot(sin(u_time * .05) * .2);
	float t = 0.1;
	vec3 col = vec3(0.);
	float ac = 0.0;

	for (int i = 0; i < 99; i++){
		vec3 pos = ro + ray * t;
		pos = mod(pos-2., 4.) -2.;
		gTime = u_time -float(i) * 0.01;
		
		float d = map(pos, u_time);

		d = max(abs(d), 0.01);
		ac += exp(-d*23.);

		t += d* 0.55;
	}

	col = vec3(ac * 0.02);

	col +=vec3(0.,0.2 * abs(sin(u_time)),0.5 + sin(u_time) * 0.2);

	gl_FragColor = vec4(col ,1.0 - t * (0.02 + 0.02 * sin (u_time)));
}
`,
  "universeWithin": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define S(a, b, t) smoothstep(a, b, t)
#define NUM_LAYERS 4.

float N21(vec2 p) {
	vec3 a = fract(vec3(p.xyx) * vec3(213.897, 653.453, 253.098));
    a += dot(a, a.yzx + 79.76);
    return fract((a.x + a.y) * a.z);
}

vec2 GetPos(vec2 id, vec2 offs, float t) {
    float n = N21(id+offs);
    float n1 = fract(n*10.);
    float n2 = fract(n*100.);
    float a = t+n;
    return offs + vec2(sin(a*n1), cos(a*n2))*.4;
}

float GetT(vec2 ro, vec2 rd, vec2 p) {
	return dot(p-ro, rd); 
}

float LineDist(vec3 a, vec3 b, vec3 p) {
	return length(cross(b-a, p-a))/length(p-a);
}

float df_line( in vec2 a, in vec2 b, in vec2 p)
{
    vec2 pa = p - a, ba = b - a;
	float h = clamp(dot(pa,ba) / dot(ba,ba), 0., 1.);	
	return length(pa - ba * h);
}

float line(vec2 a, vec2 b, vec2 uv) {
    float r1 = .04;
    float r2 = .01;
    
    float d = df_line(a, b, uv);
    float d2 = length(a-b);
    float fade = S(1.5, .5, d2);
    
    fade += S(.05, .02, abs(d2-.75));
    return S(r1, r2, d)*fade;
}

float NetLayer(vec2 st, float n, float t) {
    vec2 id = floor(st)+n;

    st = fract(st)-.5;
   
    // Заменяем массив на отдельные переменные для WebGL 1.0
    vec2 p0 = GetPos(id, vec2(-1.,-1.), t);
    vec2 p1 = GetPos(id, vec2(0.,-1.), t);
    vec2 p2 = GetPos(id, vec2(1.,-1.), t);
    vec2 p3 = GetPos(id, vec2(-1.,0.), t);
    vec2 p4 = GetPos(id, vec2(0.,0.), t);
    vec2 p5 = GetPos(id, vec2(1.,0.), t);
    vec2 p6 = GetPos(id, vec2(-1.,1.), t);
    vec2 p7 = GetPos(id, vec2(0.,1.), t);
    vec2 p8 = GetPos(id, vec2(1.,1.), t);
    
    float m = 0.;
    float sparkle = 0.;
    
    // Центральная точка p4 соединяется со всеми остальными
    m += line(p4, p0, st);
    m += line(p4, p1, st);
    m += line(p4, p2, st);
    m += line(p4, p3, st);
    m += line(p4, p5, st);
    m += line(p4, p6, st);
    m += line(p4, p7, st);
    m += line(p4, p8, st);
    
    // Вычисляем sparkle для каждой точки
    float d0 = length(st-p0);
    float s0 = (.005/(d0*d0)) * S(1., .7, d0) * pow(sin((fract(p0.x)+fract(p0.y)+t)*5.)*.4+.6, 20.);
    sparkle += s0;
    
    float d1 = length(st-p1);
    float s1 = (.005/(d1*d1)) * S(1., .7, d1) * pow(sin((fract(p1.x)+fract(p1.y)+t)*5.)*.4+.6, 20.);
    sparkle += s1;
    
    float d2 = length(st-p2);
    float s2 = (.005/(d2*d2)) * S(1., .7, d2) * pow(sin((fract(p2.x)+fract(p2.y)+t)*5.)*.4+.6, 20.);
    sparkle += s2;
    
    float d3 = length(st-p3);
    float s3 = (.005/(d3*d3)) * S(1., .7, d3) * pow(sin((fract(p3.x)+fract(p3.y)+t)*5.)*.4+.6, 20.);
    sparkle += s3;
    
    float d4 = length(st-p4);
    float s4 = (.005/(d4*d4)) * S(1., .7, d4) * pow(sin((fract(p4.x)+fract(p4.y)+t)*5.)*.4+.6, 20.);
    sparkle += s4;
    
    float d5 = length(st-p5);
    float s5 = (.005/(d5*d5)) * S(1., .7, d5) * pow(sin((fract(p5.x)+fract(p5.y)+t)*5.)*.4+.6, 20.);
    sparkle += s5;
    
    float d6 = length(st-p6);
    float s6 = (.005/(d6*d6)) * S(1., .7, d6) * pow(sin((fract(p6.x)+fract(p6.y)+t)*5.)*.4+.6, 20.);
    sparkle += s6;
    
    float d7 = length(st-p7);
    float s7 = (.005/(d7*d7)) * S(1., .7, d7) * pow(sin((fract(p7.x)+fract(p7.y)+t)*5.)*.4+.6, 20.);
    sparkle += s7;
    
    float d8 = length(st-p8);
    float s8 = (.005/(d8*d8)) * S(1., .7, d8) * pow(sin((fract(p8.x)+fract(p8.y)+t)*5.)*.4+.6, 20.);
    sparkle += s8;
    
    // Дополнительные линии
    m += line(p1, p3, st);
	m += line(p1, p5, st);
    m += line(p7, p5, st);
    m += line(p7, p3, st);
    
    float sPhase = (sin(t+n)+sin(t*.1))*.25+.5;
    sPhase += pow(sin(t*.1)*.5+.5, 50.)*5.;
    m += sparkle*sPhase;
    
    return m;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy-u_resolution.xy*.5)/u_resolution.y;
	vec2 M = u_mouse.xy/u_resolution.xy-.5;
    
    float t = u_time*.1;
    
    float s = sin(t);
    float c = cos(t);
    mat2 rot = mat2(c, -s, s, c);
    vec2 st = uv*rot;  
	M *= rot*2.;
    
    float m = 0.;
    for(float i=0.; i<1.; i+=1./NUM_LAYERS) {
        float z = fract(t+i);
        float size = mix(15., 1., z);
        float fade = S(0., .6, z)*S(1., .8, z);
        
        m += fade * NetLayer(st*size-M*z, i, u_time);
    }
    
	// Процедурная генерация FFT вместо texelFetch(iChannel0)
    float fft = sin(u_time * 2.0) * 0.5 + 0.5;
    fft = pow(fft, 2.0);
    float glow = -uv.y*fft*2.;
   
    vec3 baseCol = vec3(s, cos(t*.4), -sin(t*.24))*.4+.6;
    vec3 col = baseCol*m;
    col += baseCol*glow;
    
    col *= 1.-dot(uv,uv);
    t = mod(u_time, 230.);
    col *= S(0., 20., t)*S(224., 200., t);
    
    gl_FragColor = vec4(col,1.);
}
`,
  "custom-shader-1": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

float seg(in vec2 p, in vec2 a, in vec2 b) {
    vec2 pa = p-a, ba = b-a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}

float cosh(float x) {
    return (exp(x) + exp(-x)) * 0.5;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float a = atan(uv.y, uv.x);
    vec2 p = cos(a + u_time) * vec2(cos(0.5 * u_time), sin(0.3 * u_time));
    vec2 q = (cos(u_time)) * vec2(cos(u_time), sin(u_time));
    
    float d1 = length(uv - p);
    float d2 = length(uv - vec2(0.0));
    
    float denom = d1 + d2;
    vec2 uv2 = 2. * cos(log(length(uv))*0.25 - 0.5 * u_time + log(vec2(d1,d2)/max(denom, 0.0001)));
    
    vec2 fpos = fract(4. *  uv2) - 0.5;
    float d = max(abs(fpos.x), abs(fpos.y));
    float k = 5. / max(u_resolution.y, 1.0);
    float s = smoothstep(-k, k, 0.25 - d);
    vec3 col = vec3(s, 0.5 * s, 0.1-0.1 * s);
    col += 1./cosh(-2.5 * (length(uv - p) + length(uv))) * vec3(1,0.5,0.1);
    
    float c = cos(10. * length(uv2) + 4. * u_time);
    col += (0.5 + 0.5 * c) * vec3(0.5,1,1) *
           exp(-9. * abs(cos(9. * a + u_time) * uv.x
                       + sin(9. * a + u_time) * uv.y 
                       + 0.1 * c));
    
    gl_FragColor = vec4(col,1.0);
}
`,
  "hexagon-x5": `
#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define R     u_resolution
#define T     u_time
#define M     u_mouse

#define PI    3.141592653
#define PI2   6.283185307

const float N = 3.;
const float s4 = .577350, s3 = .288683, s2 = .866025;
const vec2 s = vec2(1.732,1);

vec3 clr, trm;
float tk, ln;
mat2 r2,r3;

mat2 rot(float g) { return mat2(cos(g), sin(g),-sin(g), cos(g)); }
float hash21(vec2 p) { 
    p.x = mod(p.x,3.*N);
    return fract(sin(dot(p,vec2(26.37,45.93)))*4374.23); 
}

// Hexagon grid system, can be simplified but
// written out long-form for readability. 
// return vec2 uv and vec2 id
vec4 hexgrid(vec2 uv) {
    vec2 p1 = floor(uv/vec2(1.732,1))+.5,
         p2 = floor((uv-vec2(1,.5))/vec2(1.732,1))+.5;
    vec2 h1 = uv- p1*vec2(1.732,1),
         h2 = uv-(p2+.5)*vec2(1.732,1);
    return dot(h1,h1) < dot(h2,h2) ? vec4(h1,p1) : vec4(h2,p2+.5);
}

void draw(float d, float px, inout vec3 C) {
    float b = abs(d)-tk;
    C = mix(C,C*.25,smoothstep(.1+px,-px,b-.01) );
    C = mix(C,clr,smoothstep(px,-px,b ));
    C = mix(C,clamp(C+.2,C,vec3(.95)),smoothstep(.01+px,-px, b+.1 ));
    C = mix(C,trm,smoothstep(px,-px,abs(b)-ln ));
}

void main() {
    r2 = rot( 1.047);
    r3 = rot(-1.047);
    
    vec2 uv = (2.*gl_FragCoord.xy-R.xy)/max(R.x,R.y);
  
    uv = -vec2(log(length(uv)),atan(uv.y,uv.x))-((2.*M.xy-R.xy)/R.xy);
    uv /= 3.628;
    uv *= N;
        
    uv.y += T*.05;
    uv.x += T*.15;
    vec2 mv=uv;
    float sc = 3., px = fwidth(uv.x*sc);

    vec4 H = hexgrid(uv.yx*sc);
    vec2 p = H.xy, id = H.zw;

    float hs = hash21(id);
    
    if(hs<.5) p *= hs < .25 ? r3 : r2;

    vec2 p0 = p - vec2(-s3, .5),
         p1 = p - vec2( s4,  0),
         p2 = p - vec2(-s3,-.5);

    vec3 d3 = vec3(length(p0), length(p1), length(p2));
    vec2 pp = vec2(0);

    if(d3.x>d3.y) pp = p1;
    if(d3.y>d3.z) pp = p2;
    if(d3.z>d3.x && d3.y>d3.x) pp = p0;
     
    ln = .015;
    tk = .14+.1*sin(uv.x*5.+T);
    
    vec3 C = vec3(0);
    
    // tile background
    float d = max(abs(p.x)*.866025 + abs(p.y)/2., abs(p.y))-(.5-ln);
    // Заменяем texture(iChannel0,...) на процедурную генерацию
    vec3 texColor = vec3(0.906,0.282,0.075) * (0.5 + 0.5 * sin(p.x * 10.0 + T) * sin(p.y * 10.0 + T));
    C = mix(vec3(.0125),texColor,smoothstep(px,-px,d) );
    C = mix(C,C+.1,mix(smoothstep(px,-px,d+.035),0.,clamp(1.-(H.y+.15),0.,1.)) );
    C = mix(C,C*.1,mix(smoothstep(px,-px,d+.025),0.,clamp(1.-(H.x+.5),0.,1.)) );
    
    // base tile and empty vars
    float b = length(pp)-s3;
    float t = 1e5, g = 1e5;
    float tg= 1.;
    
    hs = fract(hs*53.71);

    // alternate tiles
    if(hs>.95) {
        vec2 p4 = p*r3, p5 = p*r2;
        
        b = length(vec2(p.x,abs(p.y)-.5));
        g = length(p5.x);
        t = length(p4.x);
        tg= 0.;
    }else if(hs>.65) {
        b = length(p.x);
        g = min(length(p1)-s3,length(p1+vec2(1.155,0))-s3);
        
        tg= 0.;
    } else if(hs<.15) {
        vec2 p4 = p*r3, p5 = p*r2;
        
        t = length(p.x);
        b = length(p5.x);
        g = length(p4.x);
        
        tg= 0.;
    } else if(hs<.22) {
        b = length(vec2(p.x,abs(p.y)-.5));
        g = min(length(p1)-s3,length(p1+vec2(1.155,0))-s3);

    }
    
    clr = vec3(0.420,0.278,0.043);
    trm = vec3(.0);
    
    // draw segments
    draw(t,px,C);
    draw(g,px,C);
    draw(b,px,C);
    // solid balls
    if(tg>0.){
        float v = length(p)-.25;
        C = mix(C,C*.25,smoothstep(.1+px,-px,v-.01) );
        C = mix(C,clr,smoothstep(px,-px,v ));
        C = mix(C,clamp(C+.2,C,vec3(.95)),smoothstep(.01+px,-px, v+.1 ));
        C = mix(C,trm,smoothstep(px,-px,abs(v)-ln ));
    
    }
    
    C = pow(C,vec3(.4545));
    gl_FragColor = vec4(C,1);
}
`,
  "traced-tunnel": `
#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Sample number: Higher is better, but slower. Eight is enough. :)
const int sampleNum = 8;

// 2D rotation.
mat2 r2(float a){ return mat2(cos(a), sin(a), -sin(a), cos(a)); }

// Random functions: All based on IQ's originals.

// vec2 to float hash.
float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(425.215, 714.388)))*45758.5453);
}

// vec2 to vec2 hash.
vec2 hash22(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(72.927, 98.283)), dot(p, vec2(41.295, 57.263))))
                  *vec2(43758.5453, 23421.6361));
}

// vec2 to vec3 hash.
vec3 hash23(vec2 p){
    return fract(sin(vec3(dot(p, vec2(12.989, 78.233)), dot(p, vec2(51.898, 56.273)),
                      dot(p, vec2(41.898, 57.263)))) *vec3(43758.5453, 23421.6361, 65426.6357));
}

// Also from NuSan's example. I tried other variations, but
// this just seems to work better.
float tick(float t, float d) {
  
  float m = fract(t/d);
  m = smoothstep(0., 1., m);
  m = smoothstep(0., 1., m);
  return (floor(t/d) + m)*d;
}

// NuSan's cool camera tick function.
float tickTime(float t){ return t*2. + tick(t, 4.)*.75; }

// Camera movement. Adapted from NuSan's example.
void cam(inout vec3 p, float tm, float tTime) {
  
    // CAM_SWING
  	p.xz *= r2(sin(tTime*.3)*.4);
  	p.xy *= r2(sin(tTime*.1)*2.);
    
}

// Plane intersection: Old formula, and could do with some tidying up.
float rayPlane(vec3 ro, vec3 rd, vec3 n, float d){

    float t = 1e8;
	float ndotdir = dot(rd, n);
     
	if (ndotdir < 0.){
	
		float dist = (-d - dot(ro, n) + 9e-7)/ndotdir;
   		
		if (dist>0. && dist<t){ 
            t = dist; 
		}
	}
    
    return t;

}

float udBox(in vec2 p, in vec2 b){
	return length(max(abs(p) - b + .1, 0.)) - .1;
}

// Used for polar mapping various shapes.
float uvShape(vec2 p){
    // Polar mapping a square wall.
    p = abs(p);
    return max(p.x, p.y);
}

// Процедурная генерация текстуры вместо texture(iChannel0, ...)
vec3 procTexture(vec2 uv) {
    vec2 id = floor(uv);
    vec2 gv = fract(uv) - 0.5;
    float d = length(gv);
    float m = smoothstep(0.3, 0.0, d);
    vec3 col = vec3(0.5 + 0.5 * sin(id.x * 0.5 + u_time));
    col += vec3(0.3 + 0.3 * sin(id.y * 0.3 + u_time * 0.7));
    return col * m;
}

void main(){

    // Aspect correct screen coordinates.
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy*.5)/u_resolution.y;
    

    // Depth of field (DOF) amount, and the DOF distance.
    const float DOF = .05, DOFDist = 3.;
    
    // Global time, and tick time.
    float tm = u_time;
    float tickTm = tickTime(tm);
    
    // Initial camera position.
    vec3 ca = vec3(0, 0, tickTm);
    
    // Initialize the scene color to zero.
    vec3 col = vec3(0);

    // Taking a few samples.
    for(int j = 0; j<sampleNum; j++) {

        // Pixel offset.
        vec2 offs = hash22(uv + float(j)*74.542 + 35.877) - .5;
 
        vec3 ro = vec3(0);
        // Depth of field.
        ro.xy += offs*DOF;
        vec3 r = normalize(vec3(uv - offs*DOF/DOFDist, 1));

        // Camera movement.
        cam(ro, tm, tickTm);
        cam(r, tm, tickTm);
        
        ro.z += ca.z;

        // Alpha, for blending layers.
        float alpha = 1.;

        // Fog distance.
        float fogD = 1e5;

        // Reflective bounces. Just three here.
        for(int i = 0; i<3; i++) {

            // Tracing the four planes, then determining the closest.
            vec4 pl; // Vector storage for the four planes.
            pl.x = rayPlane(ro, r, vec3(0, 1, 0), 1.); // Bottom.
            pl.y = rayPlane(ro, r, vec3(0, -1, 0), 1.); // Top.
            pl.z = rayPlane(ro, r, vec3(1, 0, 0), 1.); // Left.
            pl.w = rayPlane(ro, r, vec3(-1, 0, 0), 1.); // Right.
           
            // Minimum plane distance.
            float d = min(min(pl.x, pl.y), min(pl.z, pl.w));
    
            // Set the fog distance on the first pass.
            if(i==0) fogD = d;

            // Hit position.
            vec3 p = ro + r*d;
            // Determine the UV coordinates for texturing, and the normal.
            vec3 n = vec3(0,  pl.x<pl.y? 1 : -1, 0);
            vec2 tuv = p.xz + vec2(0, n.y);

            // If we've hit the side walls instead, change the normal and UVs accordingly.
            if(min(pl.z, pl.w)<min(pl.x, pl.y)) {
                n = vec3(pl.z<pl.w? 1 : -1, 0, 0);
                tuv = p.yz + vec2(n.x, 0); // Left walls.
            }

            // Texture scaling for texturing.
            const float sc = 12.;
            tuv *= sc;
            
            // Sample color.
            vec3 sampleCol = vec3(1);
            
            // Grid square ID and local coordinates.
            vec2 id = floor(tuv);
            tuv -= id + .5;
            
            // Use the UV coordinates to create a whitish colored rounded box grid.
            float patDist = udBox(tuv, vec2(.4));
            // Use the square grid shape for shading.
            float sh = clamp(.5 - patDist/.2, 0., 1.);
       
            // Subtle coloring.
            vec3 sqCol = .85 + .3*cos((hash21(id + .2)*2.)*6.2831 + vec3(0, 1, 2));
            sampleCol = mix(vec3(0), sqCol*sh, (1. - smoothstep(0., .005, patDist)));
 
            // Quantized squarish polar mapping.
            const vec2 txSc = vec2(2, 1./2.);
            vec3 ip3 = (floor(p*sc) + .0)/sc;
            float ang = atan(ip3.x, ip3.y)/6.2831;
            vec2 tnuv = vec2(uvShape(ip3.xy)*ang*txSc.x, ip3.z*txSc.y);
            
            // Smooth squarish polar mapping.
            const vec2 txSc2 = vec2(1, 1./4.);
    		vec3 p3 = mix(p, (floor(p*sc) + .0)/sc, .8);
            float ang2 = atan(p3.x, p3.y)/6.2831;
            vec2 tnuv2 = vec2(uvShape(p3.xy)*ang2*txSc2.x + p3.z*.075, p3.z*txSc2.y);

            // Процедурные текстуры вместо texture(iChannel0, ...) и texture(iChannel1, ...)
            vec3 tx = procTexture(fract(tnuv - .5 - vec2(u_time/(sc)/2., 0)));
            tx = mix(tx, vec3(dot(tx, vec3(.299, .587, .114))), .75);
            tx = smoothstep(.1, .55, tx);

            vec3 tx2 = procTexture(fract(tnuv2 - .5 - vec2(u_time/(sc)/2., 0)));
            tx2 = smoothstep(.18, .5, tx2);
            
            // Apply the textures to the sample color. 
            sampleCol *= tx*tx2*4.; 
            
            // Some fakish point lighting. 
            vec3 ld = normalize(ca + vec3(0, 0, 3) - p);
            float dif = max(dot(ld, n), 0.);
            float spe = pow(max(dot(reflect(ld, -n), -r), 0.), 8.);
            float fre = pow(max(1. - abs(dot(r, n))*.5, 0.), 1.);
            
            sampleCol *= (dif + vec3(1, .9, .7)*spe*4. + vec3(.5, .7, 1)*fre);
            
            // Applying some fog.
            sampleCol *= 1.35/(1. + fogD*fogD*.05);
         
            // Add the sample color to overall accumulated scene color.
            col += sampleCol*alpha*fre;
            
            // Reduce the alpha factor by a bit.
            alpha *= .9;

            // Calculate the reflection vector for the next pass.
            float h = hash21(id)*smoothstep(0., .005, -patDist + .15);
          
            // Purely reflected vector.
            vec3 ref = reflect(r,n);
            // Random vector.
            r = normalize(hash23(uv + float(j)*74.524 + float(i)*35.712) - .5);
            // Mixing the purely reflected vector with the random vector.
            r = normalize(mix(ref, r, (hash21(tuv)*.0 + h*.1*sh)*exp(-fogD*.05)));
            
            // Ensuring random reflection.
            r = dot(r, n)<0.? -r : r;

            // Advance the position to the new hit point.
            ro = p + n*.0011;
        }

    }
    
    // Divide by the total number of samples.
    col /= float(sampleNum);
    
    // Gamma correction and screen presentation.
    gl_FragColor = vec4(pow(max(col, 0.), vec3(0.4545)), 1);
    
}
`,
  "spin-effect": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Configuration (modify these values to change the effect)
#define SPIN_ROTATION -2.0
#define SPIN_SPEED 7.0
#define OFFSET vec2(0.0)
#define COLOUR_1 vec4(0.871, 0.267, 0.231, 1.0)
#define COLOUR_2 vec4(0.0, 0.42, 0.706, 1.0)
#define COLOUR_3 vec4(0.086, 0.137, 0.145, 1.0)
#define CONTRAST 3.5
#define LIGTHING 0.4
#define SPIN_AMOUNT 0.25
#define PIXEL_FILTER 745.0
#define SPIN_EASE 1.0
#define PI 3.14159265359
#define IS_ROTATE false

vec4 effect(vec2 screenSize, vec2 screen_coords) {
    float pixel_size = length(screenSize.xy) / PIXEL_FILTER;
    vec2 uv = (floor(screen_coords.xy*(1./pixel_size))*pixel_size - 0.5*screenSize.xy)/length(screenSize.xy) - OFFSET;
    float uv_len = length(uv);
    
    float speed = (SPIN_ROTATION*SPIN_EASE*0.2);
    if(IS_ROTATE){
       speed = u_time * speed;
    }
    speed += 302.2;
    float new_pixel_angle = atan(uv.y, uv.x) + speed - SPIN_EASE*20.*(1.*SPIN_AMOUNT*uv_len + (1. - 1.*SPIN_AMOUNT));
    vec2 mid = (screenSize.xy/length(screenSize.xy))/2.;
    uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x), (uv_len * sin(new_pixel_angle) + mid.y)) - mid);
    
    uv *= 30.;
    speed = u_time*(SPIN_SPEED);
    vec2 uv2 = vec2(uv.x+uv.y);
    
    for(int i=0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv  += 0.5*vec2(cos(5.1123314 + 0.353*uv2.y + speed*0.131121),sin(uv2.x - 0.113*speed));
        uv  -= 1.0*cos(uv.x + uv.y) - 1.0*sin(uv.x*0.711 - uv.y);
    }
    
    float contrast_mod = (0.25*CONTRAST + 0.5*SPIN_AMOUNT + 1.2);
    float paint_res = min(2., max(0.,length(uv)*(0.035)*contrast_mod));
    float c1p = max(0.,1. - contrast_mod*abs(1.-paint_res));
    float c2p = max(0.,1. - contrast_mod*abs(paint_res));
    float c3p = 1. - min(1., c1p + c2p);
    float light = (LIGTHING - 0.2)*max(c1p*5. - 4., 0.) + LIGTHING*max(c2p*5. - 4., 0.);
    return (0.3/CONTRAST)*COLOUR_1 + (1. - 0.3/CONTRAST)*(COLOUR_1*c1p + COLOUR_2*c2p + vec4(c3p*COLOUR_3.rgb, c3p*COLOUR_1.a)) + light;
}

void main() {
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    
    gl_FragColor = effect(u_resolution.xy, uv * u_resolution.xy);
}
`,
  "fxaa-effect": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// FXAA code from: http://www.geeks3d.com/20110405/fxaa-fast-approximate-anti-aliasing-demo-glsl-opengl-test-radeon-geforce/3/

#define FXAA_SPAN_MAX 8.0
#define FXAA_REDUCE_MUL   (1.0/FXAA_SPAN_MAX)
#define FXAA_REDUCE_MIN   (1.0/128.0)
#define FXAA_SUBPIX_SHIFT (1.0/4.0)

// Процедурная генерация текстуры вместо sampler2D
vec3 procTexture(vec2 uv) {
    vec2 p = uv * 10.0;
    float d = length(fract(p) - 0.5);
    float m = smoothstep(0.3, 0.0, d);
    vec3 col = vec3(0.5 + 0.5 * sin(p.x * 3.14159 + u_time));
    col += vec3(0.3 + 0.3 * sin(p.y * 2.0 + u_time * 0.7));
    col += vec3(0.2 + 0.2 * sin((p.x + p.y) * 1.5 + u_time * 0.5));
    return col * m;
}

vec3 FxaaPixelShader( vec4 uv, vec2 rcpFrame) {
    
    vec3 rgbNW = procTexture(uv.zw);
    vec3 rgbNE = procTexture(uv.zw + vec2(1,0)*rcpFrame.xy);
    vec3 rgbSW = procTexture(uv.zw + vec2(0,1)*rcpFrame.xy);
    vec3 rgbSE = procTexture(uv.zw + vec2(1,1)*rcpFrame.xy);
    vec3 rgbM  = procTexture(uv.xy);

    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM  = dot(rgbM,  luma);

    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

    vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

    float dirReduce = max(
        (lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL),
        FXAA_REDUCE_MIN);
    float rcpDirMin = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);
    
    dir = min(vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),
          max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
          dir * rcpDirMin)) * rcpFrame.xy;

    vec3 rgbA = (1.0/2.0) * (
        procTexture(uv.xy + dir * (1.0/3.0 - 0.5)) +
        procTexture(uv.xy + dir * (2.0/3.0 - 0.5)));
    vec3 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (
        procTexture(uv.xy + dir * (0.0/3.0 - 0.5)) +
        procTexture(uv.xy + dir * (3.0/3.0 - 0.5)));
    
    float lumaB = dot(rgbB, luma);

    if((lumaB < lumaMin) || (lumaB > lumaMax)) return rgbA;
    
    return rgbB; 
}

void main() {
    vec2 rcpFrame = 1./u_resolution.xy;
  	vec2 uv2 = gl_FragCoord.xy / u_resolution.xy;
        
    vec3 col;
    
    vec4 uv = vec4( uv2, uv2 - (rcpFrame * (0.5 + FXAA_SUBPIX_SHIFT)));
    col = FxaaPixelShader( uv, 1./u_resolution.xy );

    
	col = pow(col * .5 + .0, vec3(1.3));
    col *= 1. - abs(sin(gl_FragCoord.y * .8)) * .4;
    gl_FragColor = vec4( col, 1. );
}
`,
  "digital-clock": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define TWELVE_HOUR_CLOCK   1
#define GLOWPULSE    1
#define SHOW_GRID

float pi = atan(1.0)*4.0;
float tau = atan(1.0)*8.0;

const float scale = 1.0 / 6.0;

vec2 digitSize = vec2(1.0,1.5) * scale;
vec2 digitSpacing = vec2(1.1,1.6) * scale;

// hash function copy from https://www.shadertoy.com/view/4djSRW
float hash12(vec2 p)
{
    vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 pos) {
    vec2 i = floor(pos);
    vec2 f = fract(pos);
    
    float a = hash12(i);
    float b = hash12(i + vec2(1, 0));
    float c = hash12(i + vec2(0, 1));
    float d = hash12(i + vec2(1, 1));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

//Distance to a line segment,
float dfLine(vec2 start, vec2 end, vec2 uv)
{
	start *= scale;
	end *= scale;
    
	vec2 line = end - start;
	float frac = dot(uv - start,line) / dot(line,line);
	return distance(start + line * clamp(frac, 0.0, 1.0), uv);
}

//Distance to the edge of a circle.
float dfCircle(vec2 origin, float radius, vec2 uv)
{
	origin *= scale;
	radius *= scale;
    
	return abs(length(uv - origin) - radius);
}

//Distance to an arc.
float dfArc(vec2 origin, float start, float sweep, float radius, vec2 uv)
{
	origin *= scale;
	radius *= scale;
    
	uv -= origin;
	uv *= mat2(cos(start), sin(start),-sin(start), cos(start));
	
	float offs = (sweep / 2.0 - pi);
	float ang = mod(atan(uv.y, uv.x) - offs, tau) + offs;
	ang = clamp(ang, min(0.0, sweep), max(0.0, sweep));
	
	return distance(radius * vec2(cos(ang), sin(ang)), uv);
}

//Distance to the digit "d" (0-9).
float dfDigit(vec2 origin, float d, vec2 uv)
{
	uv -= origin;
	d = floor(d);
	float dist = 1e6;
	
	if(d == 0.0)
	{
		dist = min(dist, dfLine(vec2(1.000,1.000), vec2(1.000,0.500), uv));
		dist = min(dist, dfLine(vec2(0.000,1.000), vec2(0.000,0.500), uv));
		dist = min(dist, dfArc(vec2(0.500,1.000),0.000, 3.142, 0.500, uv));
		dist = min(dist, dfArc(vec2(0.500,0.500),3.142, 3.142, 0.500, uv));
		return dist;
	}
	if(d == 1.0)
	{
		dist = min(dist, dfLine(vec2(0.500,1.500), vec2(0.500,0.000), uv));
		return dist;
	}
	if(d == 2.0)
	{
		dist = min(dist, dfLine(vec2(1.000,0.000), vec2(0.000,0.000), uv));
		dist = min(dist, dfLine(vec2(0.388,0.561), vec2(0.806,0.719), uv));
		dist = min(dist, dfArc(vec2(0.500,1.000),0.000, 3.142, 0.500, uv));
		dist = min(dist, dfArc(vec2(0.700,1.000),5.074, 1.209, 0.300, uv));
		dist = min(dist, dfArc(vec2(0.600,0.000),1.932, 1.209, 0.600, uv));
		return dist;
	}
	if(d == 3.0)
	{
		dist = min(dist, dfLine(vec2(0.000,1.500), vec2(1.000,1.500), uv));
		dist = min(dist, dfLine(vec2(1.000,1.500), vec2(0.500,1.000), uv));
		dist = min(dist, dfArc(vec2(0.500,0.500),3.142, 4.712, 0.500, uv));
		return dist;
	}
	if(d == 4.0)
	{
		dist = min(dist, dfLine(vec2(0.700,1.500), vec2(0.000,0.500), uv));
		dist = min(dist, dfLine(vec2(0.000,0.500), vec2(1.000,0.500), uv));
		dist = min(dist, dfLine(vec2(0.700,1.200), vec2(0.700,0.000), uv));
		return dist;
	}
	if(d == 5.0)
	{
		dist = min(dist, dfLine(vec2(1.000,1.500), vec2(0.300,1.500), uv));
		dist = min(dist, dfLine(vec2(0.300,1.500), vec2(0.200,0.900), uv));
		dist = min(dist, dfArc(vec2(0.500,0.500),3.142, 5.356, 0.500, uv));
		return dist;
	}
	if(d == 6.0)
	{
		dist = min(dist, dfLine(vec2(0.067,0.750), vec2(0.500,1.500), uv));
		dist = min(dist, dfCircle(vec2(0.500,0.500), 0.500, uv));
		return dist;
	}
	if(d == 7.0)
	{
		dist = min(dist, dfLine(vec2(0.000,1.500), vec2(1.000,1.500), uv));
		dist = min(dist, dfLine(vec2(1.000,1.500), vec2(0.500,0.000), uv));
		return dist;
	}
	if(d == 8.0)
	{
		dist = min(dist, dfCircle(vec2(0.500,0.400), 0.400, uv));
		dist = min(dist, dfCircle(vec2(0.500,1.150), 0.350, uv));
		return dist;
	}
	if(d == 9.0)
	{
		dist = min(dist, dfLine(vec2(0.933,0.750), vec2(0.500,0.000), uv));
		dist = min(dist, dfCircle(vec2(0.500,1.000), 0.500, uv));
		return dist;
	}

	return dist;
}

//Distance to a number
float dfNumber(vec2 origin, float num, vec2 uv)
{
	uv -= origin;
	float dist = 1e6;
	float offs = 0.0;
	
	for(float i = 5.0;i > -3.0;i--)
	{	
		float d = mod(num / pow(10.0,i),10.0);
		
		vec2 pos = digitSpacing * vec2(offs,0.0);

		if(i == 0.0)
		{
			dist = min(dist, dfCircle(vec2(offs+0.9,0.1)*1.1, 0.04,uv));
		}
		
		if(num > pow(10.0,i) || i == 0.0)
		{
			dist = min(dist, dfDigit(pos, d, uv));
			offs++;
		}	
	}
	return dist;	
}

//Distance to a number This handles 2 digit integers, leading 0's will be drawn
float dfNumberInt(vec2 origin, int inum, vec2 uv)
{
    float num = float(inum);
	uv -= origin;
	float dist = 1e6;
	float offs = 0.0;
	
	for(float i = 1.0;i >= 0.0;i--)
	{	
		float d = mod(num / pow(10.0,i),10.0);
		
		vec2 pos = digitSpacing * vec2(offs,0.0);
		
        dist = min(dist, dfDigit(pos, d, uv));
        offs++;
	}
	return dist;	
}

float dfColon(vec2 origin, vec2 uv) {
	uv -= origin;
	float dist = 1e6;
	float offs = 0.0;

    dist = min(dist, dfCircle(vec2(offs+0.9,0.9)*1.1, 0.04,uv));
    dist = min(dist, dfCircle(vec2(offs+0.9,0.4)*1.1, 0.04,uv));
    return dist;
}

//Length of a number in digits
float numberLength(float n)
{
	return floor(max(log(n) / log(10.0), 0.0) + 1.0) + 2.0;
}

void main() 
{
	vec2 aspect = u_resolution.xy / u_resolution.y;
	vec2 uv = (gl_FragCoord.xy / u_resolution.y - aspect/2.0) *0.86;
	
    // Вычисляем время из u_time (секунды с начала дня)
    // Используем остаток от деления на 86400 (секунды в дне)
    float secondsInDay = mod(u_time, 86400.0);
    int hour = int(secondsInDay/3600.);
#if TWELVE_HOUR_CLOCK
    if( hour > 12 ) hour -= 12;
    if( hour == 0 ) hour = 12;
#endif
    int minute = int(mod(secondsInDay/60.,60.));
    
	float nsize = numberLength(9999.);
	vec2 pos = -digitSpacing * vec2(nsize,1.0)/2.0;

    vec2 basepos = pos;
    pos.x = basepos.x + 0.16;
	float dist = 1e6;
	dist = min(dist, dfNumberInt(pos, hour, uv));
    
    pos.x = basepos.x + 0.39;
	dist = min(dist, dfColon( pos, uv ));
    
    pos.x = basepos.x + 0.60;
    float dist2 = 1e6;
	dist = min(dist, dfNumberInt(pos, minute, uv));
	
	vec3 color = vec3(0);
	
	float shade = 0.0;
	
	shade = 0.004 / (dist);
	
	color += vec3(1,0.2,0) * shade;
#if GLOWPULSE
	color += vec3(1,0.2,0) * shade * noise((uv + vec2(u_time*.5)) * 2.5 + .5);
#endif

    #ifdef SHOW_GRID
    float grid = 0.5-max(abs(mod(uv.x*64.0,1.0)-0.5), abs(mod(uv.y*64.0,1.0)-0.5));
    
    color *= 0.25+vec3(smoothstep(0.0,64.0 / u_resolution.y,grid))*0.75;
    #endif
	
	gl_FragColor = vec4( color , 1.0 );
}
`,
  "galaxy-trip": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Increase pass count for a denser effect
#define PASS_COUNT 4

float fBrightness = 2.5;

// Number of angular segments
float fSteps = 121.0;

float fParticleSize = 0.015;
float fParticleLength = 0.5 / 60.0;

// Min and Max star position radius. Min must be present to prevent stars too near camera
float fMinDist = 0.8;
float fMaxDist = 5.0;

float fRepeatMin = 1.0;
float fRepeatMax = 2.0;

// fog density
float fDepthFade = 0.8;

float Random(float x)
{
	return fract(sin(x * 123.456) * 23.4567 + sin(x * 345.678) * 45.6789 + sin(x * 456.789) * 56.789);
}

vec3 GetParticleColour( const in vec3 vParticlePos, const in float fParticleSize, const in vec3 vRayDir )
{		
	vec2 vNormDir = normalize(vRayDir.xy);
	float d1 = dot(vParticlePos.xy, vNormDir.xy) / length(vRayDir.xy);
	vec3 vClosest2d = vRayDir * d1;
	
	vec3 vClampedPos = vParticlePos;
	
	vClampedPos.z = clamp(vClosest2d.z, vParticlePos.z - fParticleLength, vParticlePos.z + fParticleLength);
	
	float d = dot(vClampedPos, vRayDir);
	
	vec3 vClosestPos = vRayDir * d;
	
	vec3 vDeltaPos = vClampedPos - vClosestPos;	
		
	float fClosestDist = length(vDeltaPos) / fParticleSize;
	float fShade = clamp(1.0 - fClosestDist, 0.0, 1.0);
	
	if (d<3.0)
	{
		fClosestDist = max(abs(vDeltaPos.x),abs(vDeltaPos.y)) / fParticleSize;
		float f = clamp(1.0 - 0.8*fClosestDist, 0.0, 1.0);
		fShade += f*f*f*f;
		fShade *= fShade;
	}
	
	fShade = fShade * exp2(-d * fDepthFade) * fBrightness;
	return vec3(fShade);
}

vec3 GetParticlePos( const in vec3 vRayDir, const in float fZPos, const in float fSeed )
{
	float fAngle = atan(vRayDir.x, vRayDir.y);
	float fAngleFraction = fract(fAngle / (3.14 * 2.0));
	
	float fSegment = floor(fAngleFraction * fSteps + fSeed) + 0.5 - fSeed;
	float fParticleAngle = fSegment / fSteps * (3.14 * 2.0);

	float fSegmentPos = fSegment / fSteps;
	float fRadius = fMinDist + Random(fSegmentPos + fSeed) * (fMaxDist - fMinDist);
	
	float tunnelZ = vRayDir.z / length(vRayDir.xy / fRadius);
	
	tunnelZ += fZPos;
	
	float fRepeat = fRepeatMin + Random(fSegmentPos + 0.1 + fSeed) * (fRepeatMax - fRepeatMin);
	
	float fParticleZ = (ceil(tunnelZ / fRepeat) - 0.5) * fRepeat - fZPos;
	
	return vec3( sin(fParticleAngle) * fRadius, cos(fParticleAngle) * fRadius, fParticleZ );
}

vec3 Starfield( const in vec3 vRayDir, const in float fZPos, const in float fSeed )
{	
	vec3 vParticlePos = GetParticlePos(vRayDir, fZPos, fSeed);
	
	return GetParticleColour(vParticlePos, fParticleSize, vRayDir);	
}

vec3 RotateX( const in vec3 vPos, const in float fAngle )
{
    float s = sin(fAngle); float c = cos(fAngle);
    return vec3( vPos.x, c * vPos.y + s * vPos.z, -s * vPos.y + c * vPos.z);
}

vec3 RotateY( const in vec3 vPos, const in float fAngle )
{
    float s = sin(fAngle); float c = cos(fAngle);
    return vec3( c * vPos.x + s * vPos.z, vPos.y, -s * vPos.x + c * vPos.z);
}

vec3 RotateZ( const in vec3 vPos, const in float fAngle )
{
    float s = sin(fAngle); float c = cos(fAngle);
    return vec3( c * vPos.x + s * vPos.y, -s * vPos.x + c * vPos.y, vPos.z);
}

// Simplex Noise by IQ
vec2 hash( vec2 p )
{
	p = vec2( dot(p,vec2(127.1,311.7)),
			  dot(p,vec2(269.5,183.3)) );

	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec2 p )
{
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324865; // (3-sqrt(3))/6;

	vec2 i = floor( p + (p.x+p.y)*K1 );
	
    vec2 a = p - i + (i.x+i.y)*K2;
    vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec2 b = a - o + K2;
	vec2 c = a - 1.0 + 2.0*K2;

    vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );

	vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));

    return dot( n, vec3(70.0) );
	
}

const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

float fbm4( in vec2 p )
{
    float f = 0.0;
    f += 0.5000*noise( p ); p = m*p*2.02;
    f += 0.2500*noise( p ); p = m*p*2.03;
    f += 0.1250*noise( p ); p = m*p*2.01;
    f += 0.0625*noise( p );
    return f;
}

float marble(in vec2 p)
{
	return cos(p.x+fbm4(p));
}

float dowarp ( in vec2 q, out vec2 a, out vec2 b )
{
	float ang=0.;
	ang = 1.2345 * sin (33.33);
	mat2 m1 = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
	ang = 0.2345 * sin (66.66);
	mat2 m2 = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));

	a = vec2( marble(m1*q), marble(m2*q+vec2(1.12,0.654)) );

	ang = 0.543 * cos (13.33);
	m1 = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
	ang = 1.128 * cos (53.33);
	m2 = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));

	b = vec2( marble( m2*(q + a)), marble( m1*(q + a) ) );
	
	return marble( q + b +vec2(0.32,1.654));
}

void main()
{
 	vec2 uv = gl_FragCoord.xy / u_resolution.xy;
	vec2 q = 2.*uv-1.;
	q.y *= u_resolution.y/u_resolution.x;
	
	// camera	
	vec3 rd = normalize(vec3( q.x, q.y, 1. ));
	vec3 euler = vec3(
		sin(u_time * 0.2) * 0.625,
		cos(u_time * 0.1) * 0.625,
		u_time * 0.1 + sin(u_time * 0.3) * 0.5);

	// Проверяем, используется ли мышь (если u_mouse не нулевой)
	if(length(u_mouse) > 0.01)
	{
		euler.x = -((u_mouse.y / u_resolution.y) * 2.0 - 1.0);
		euler.y = -((u_mouse.x / u_resolution.x) * 2.0 - 1.0);
		euler.z = 0.0;
	}
	rd = RotateX(rd, euler.x);
	rd = RotateY(rd, euler.y);
	rd = RotateZ(rd, euler.z);
	
	// Nebulae Background
	float pi = 3.141592654;
	q.x = 0.5 + atan(rd.z, rd.x)/(2.*pi);
	q.y = 0.5 - asin(rd.y)/pi + 0.512 + 0.001*u_time;
	q *= 2.34;
	
	vec2 wa = vec2(0.);
	vec2 wb = vec2(0.);
	float f = dowarp(q, wa, wb);
	f = 0.5+0.5*f;
	
	vec3 col = vec3(f);
	float wc = 0.;
	wc = f;
	col = vec3(wc, wc*wc, wc*wc*wc);
	wc = abs(wa.x);
	col -= vec3(wc*wc, wc, wc*wc*wc);
	wc = abs(wb.x);
	col += vec3(wc*wc*wc, wc*wc, wc);
	col *= 0.7;
	col.x = pow(col.x, 2.18);
	col.z = pow(col.z, 1.88);
	col = smoothstep(0., 1., col);
	col = 0.5 - (1.4*col-0.7)*(1.4*col-0.7);
	col = 0.75*sqrt(col);
	col *= 1. - 0.5*fbm4(8.*q);
	col = clamp(col, 0., 1.);
	
	// StarField
	float fShade = 0.0;
	float a = 0.2;
	float b = 10.0;
	float c = 1.0;
	float fZPos = 5.0;
	float fSpeed = 0.;
	
	fParticleLength = 0.25 * fSpeed / 60.0;
	
	float fSeed = 0.0;
	
	vec3 vResult = vec3(0.);
	
	vec3 red = vec3(0.7,0.4,0.3);
	vec3 blue = vec3(0.3,0.4,0.7);
	vec3 tint = vec3(0.);
	float ti = 1./float(PASS_COUNT-1);
	float t = 0.;
	for(int i=0; i<PASS_COUNT; i++)
	{
		tint = mix(red,blue,t);
		vResult += 1.1*tint*Starfield(rd, fZPos, fSeed);
		t += ti;
		fSeed += 1.234;
		rd = RotateX(rd, 0.25*euler.x);
	}
	
	col += sqrt(vResult);
	
	// Vignetting
	vec2 r = -1.0 + 2.0*(uv);
	float vb = max(abs(r.x), abs(r.y));
	col *= (0.15 + 0.85*(1.0-exp(-(1.0-vb)*30.0)));
	gl_FragColor = vec4( col, 1.0 );
}
`,
  "ice-and-fire": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

/* ice and fire, by mattz
   License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

   Demonstrate triangulation of jittered triangular lattice.

*/
const float s3 = 1.7320508075688772;
const float i3 = 0.5773502691896258;

const mat2 tri2cart = mat2(1.0, 0.0, -0.5, 0.5*s3);
const mat2 cart2tri = mat2(1.0, 0.0, i3, 2.0*i3);

//////////////////////////////////////////////////////////////////////
// cosine based palette 
// adapted from https://www.shadertoy.com/view/ll2GD3

vec3 pal( in float t ) {
    
    const vec3 a = vec3(0.5);
    const vec3 b = vec3(0.5);
    const vec3 c = vec3(0.8, 0.8, 0.5);
    const vec3 d = vec3(0, 0.2, 0.5);
    
    return clamp(a + b*cos( 6.28318*(c*t+d) ), 0.0, 1.0);
    
}

//////////////////////////////////////////////////////////////////////
// from https://www.shadertoy.com/view/4djSRW

#define HASHSCALE1 .1031
#define HASHSCALE3 vec3(443.897, 441.423, 437.195)

float hash12(vec2 p) {
    vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);   
}

vec2 hash23(vec3 p3) {
	p3 = fract(p3 * HASHSCALE3);
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xx+p3.yz)*p3.zy);
}

//////////////////////////////////////////////////////////////////////
// compute barycentric coordinates from point differences
// adapted from https://www.shadertoy.com/view/lslXDf

vec3 bary(vec2 v0, vec2 v1, vec2 v2) {
    float inv_denom = 1.0 / (v0.x * v1.y - v1.x * v0.y);
    float v = (v2.x * v1.y - v1.x * v2.y) * inv_denom;
    float w = (v0.x * v2.y - v2.x * v0.y) * inv_denom;
    float u = 1.0 - v - w;
    return vec3(u,v,w);
}

//////////////////////////////////////////////////////////////////////
// distance to line segment from point differences

float dseg(vec2 xa, vec2 ba) {
    return length(xa - ba*clamp(dot(xa, ba)/dot(ba, ba), 0.0, 1.0));
}

//////////////////////////////////////////////////////////////////////
// generate a random point on a circle from 3 integer coords (x, y, t)

vec2 randCircle(vec3 p) {
    
    vec2 rt = hash23(p);
    
    float r = sqrt(rt.x);
    float theta = 6.283185307179586 * rt.y;
    
    return r*vec2(cos(theta), sin(theta));
    
}

//////////////////////////////////////////////////////////////////////
// make a time-varying cubic spline at integer coords p that stays
// inside a unit circle

vec2 randCircleSpline(vec2 p, float t) {

    // standard catmull-rom spline implementation
    float t1 = floor(t);
    t -= t1;
    
    vec2 pa = randCircle(vec3(p, t1-1.0));
    vec2 p0 = randCircle(vec3(p, t1));
    vec2 p1 = randCircle(vec3(p, t1+1.0));
    vec2 pb = randCircle(vec3(p, t1+2.0));
    
    vec2 m0 = 0.5*(p1 - pa);
    vec2 m1 = 0.5*(pb - p0);
    
    vec2 c3 = 2.0*p0 - 2.0*p1 + m0 + m1;
    vec2 c2 = -3.0*p0 + 3.0*p1 - 2.0*m0 - m1;
    vec2 c1 = m0;
    vec2 c0 = p0;
    
    return (((c3*t + c2)*t + c1)*t + c0) * 0.8;
    
}

//////////////////////////////////////////////////////////////////////
// perturbed point from index

vec2 triPoint(vec2 p) {
    float t0 = hash12(p);
    return tri2cart*p + 0.45*randCircleSpline(p, 0.15*u_time + t0);
}

//////////////////////////////////////////////////////////////////////
// main shading function. inputs:
// 
//   p - current pixel location in scene
//
//   tfloor - integer grid coordinates of bottom-left triangle vertex
//
//   t0, t1, t2 - displaced cartesian coordinates (xy) and integer
//                grid offsets (zw) of triangle vertices, relative
//                to tfloor
//
//   scl - pixel size in scene units
//
//   cw - pixel accumulator. xyz are rgb color pre-multiplied by
//        weights, and w is total weight.
//

void tri_color(in vec2 p, 
               in vec4 t0, in vec4 t1, in vec4 t2, 
               in float scl, 
               inout vec4 cw) {
               
    // get differences relative to vertex 0
    vec2 p0 = p - t0.xy;
    vec2 p10 = t1.xy - t0.xy;
    vec2 p20 = t2.xy - t0.xy;
    
    // get barycentric coords
    vec3 b = bary(p10, p20, p0);
    
    // distances to line segments
    float d10 = dseg(p0, p10);
    float d20 = dseg(p0, p20);
    float d21 = dseg(p - t1.xy, t2.xy - t1.xy);
    
    // unsigned distance to triangle boundary
    float d = min(min(d10, d20), d21);

    // now signed distance (negative inside, positive outside)
    d *= -sign(min(b.x, min(b.y, b.z))); 

    // only wory about coloring if close enough
    if (d < 0.5*scl) {

        //////////////////////////////////////////////////
        // generate per-vertex palette entries
    
        // sum of all integer grid indices
        vec2 tsum = t0.zw + t1.zw + t2.zw;

        // generate unique random number in [0, 1] for each vertex of
        // this triangle
        vec3 h_tri = vec3(hash12(tsum + t0.zw),
                          hash12(tsum + t1.zw),
                          hash12(tsum + t2.zw));

        //////////////////////////////////////////////////
        // now set up the "main" triangle color:
        
        // get the cartesian centroid of this triangle
        vec2 pctr = (t0.xy + t1.xy + t2.xy) / 3.0;

        // angle of scene-wide color gradient
        float theta = 1.0 + 0.01*u_time;
        vec2 dir = vec2(cos(theta), sin(theta));

        // how far are we along gradient?
        float grad_input = dot(pctr, dir) - sin(0.05*u_time);

        // h0 varies smoothly from 0 to 1
        float h0 = sin(0.7*grad_input)*0.5 + 0.5;

        // now the per-vertex random numbers are all biased towards h
        // (still in [0, 1] range tho)
        h_tri = mix(vec3(h0), h_tri, 0.4);

        //////////////////////////////////////////////////
        // final color accumulation
        
        // barycentric interpolation of per-vertex palette indices
        float h = dot(h_tri, b);

        // color lookup
        vec3 c = pal(h);
        
        // weight for anti-aliasing is 0.5 at border, 0 just outside,
        // 1 just inside
        float w = smoothstep(0.5*scl, -0.5*scl, d);

        // add to accumulator
        cw += vec4(w*c, w);
        
    }
    
}

//////////////////////////////////////////////////////////////////////

void main() {
	
    float scl = 4.1 / u_resolution.y;
    
    // get 2D scene coords
    vec2 p = (gl_FragCoord.xy - 0.5 - 0.5*u_resolution.xy) * scl;
    
    // get triangular base coords
    vec2 tfloor = floor(cart2tri * p + 0.5);

    // precompute 9 neighboring points
    vec2 pts[9];

    for (int i=0; i<3; ++i) {
        for (int j=0; j<3; ++j) {
            pts[3*i+j] = triPoint(tfloor + vec2(float(i-1), float(j-1)));
        }
    }
    
    // color accumulator
    vec4 cw = vec4(0);

    // for each of the 4 quads:
    for (int i=0; i<2; ++i) {
        for (int j=0; j<2; ++j) {
    
            // look at lower and upper triangle in this quad
            vec4 t00 = vec4(pts[3*i+j  ], tfloor + vec2(float(i-1), float(j-1)));
            vec4 t10 = vec4(pts[3*i+j+3], tfloor + vec2(float(i),   float(j-1)));
            vec4 t01 = vec4(pts[3*i+j+1], tfloor + vec2(float(i-1), float(j)));
            vec4 t11 = vec4(pts[3*i+j+4], tfloor + vec2(float(i),   float(j)));
          
            // lower
            tri_color(p, t00, t10, t11, scl, cw);

            // upper
            tri_color(p, t00, t11, t01, scl, cw);
           
        }
    }    
        
    
    // final pixel color
    gl_FragColor = cw / max(cw.w, 0.0001);
    
}
`,
  "particle-field": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define PI 3.14159

void main(){
	vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
	vec2 t = vec2(gl_FragCoord.xy / u_resolution.xy);
	
	vec3 c = vec3(0);
	
	for(int i = 0; i < 20; i++) {
		float t = 0.4 * PI * float(i) / 30.0 * u_time * 0.5;
		float x = cos(3.0*t);
		float y = sin(4.0*t);
		vec2 o = 0.40 * vec2(x, y);
		float r = fract(x);
		float g = 1.0 - r;
		c += 0.01 / (length(p-o)) * vec3(r, g, 0.9);
	}
	
	gl_FragColor = vec4(c, 1);
}
`,
  "rotating-particles": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define PI 3.14159265358979
#define N 12

void main() {
	float size = 0.2;
	float dist = 0.0;
	float ang = 0.0;
	vec2 pos = vec2(0.0,0.0);
	vec3 color = vec3(0.1);
	
	vec2 surfacePosition = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
	
	for(int i=0; i<N; i++){
		float r = 0.4;
		ang += PI / (float(N)*0.5);
		pos = vec2(cos(ang),sin(ang))*r*cos(u_time+ang/.5);
		dist += size / distance(pos,surfacePosition);
		vec3 c = vec3(0.05);
		color = c*dist;
	}
	gl_FragColor = vec4(color, 1.0);
}
`,
  "wave-particles": `
#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main(void){
	
	vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
	vec3 color1 = vec3(0.0, 0.3, 0.5);
	vec3 color2 = vec3(0.5, 0.0, 0.3);
	
	float f = 0.0;
	float g = 0.0;
	float h = 0.0;
	float PI = 3.14159265;
	for(float i = 0.0; i < 40.0; i++){
		if (floor(u_mouse.x * 41.0) < i)
			break;
		float s = sin(u_time + i * PI / 20.0) * 0.8;
		float c = cos(u_time + i * PI / 20.0) * 0.8;
		float d = abs(p.x + c);
		float e = abs(p.y + s);
		f += 0.001 / max(d, 0.0001);
		g += 0.001 / max(e, 0.0001);
		h += 0.00003 / max(d * e, 0.0001);
	}
	
	
	gl_FragColor = vec4(f * color1 + g * color2 + vec3(h), 1.0);
}
`,
  "flower-matrix": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Flower Matrix
// By: Brandon Fogerty
// xdpixel.com

void main() 
{

	vec2 uv = ( gl_FragCoord.xy / u_resolution.xy ) * 2.0 - 1.0;
	uv.x *= u_resolution.x/u_resolution.y;
	
	vec2 px = vec2(gl_FragCoord.x, gl_FragCoord.y);
	
	vec3 finalColor = vec3( 0.0, 0.0, 0.0 );

	float a = 0.;
	float r = -1.5 + length( uv );
	

	float timeT = .1;
	float move = .6 + u_time;
	
     	float t = .7 + .1 * sin(move * 1.);
    
     	finalColor += vec3( 8.0 * t, 4.0 * t, 2.0 * t );
    
     	finalColor *= .5 * (1.-r);
	
	float g = -mod( px.y + u_time, cos( px.x ) + 0.004 ) * .5;
	finalColor *= vec3( 0.0, g, 0.0 );
	
	gl_FragColor = vec4( finalColor, 1.0 );

}
`,
  "photon-torpedo": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Posted by Trisomie21
// photon torpedo?

// from http://glsl.heroku.com/e#5248.0
#define BLADES 4.0
#define BIAS 0.01
#define SHARPNESS 4.0
vec3 star(vec2 position) {
	float blade = clamp(pow(sin(atan(position.y,position.x )*BLADES)+BIAS, SHARPNESS), 0.4, 0.8);
	
	vec3 color = mix(vec3(-0.34, -0.5, -1.0), vec3(0.0, -0.5, -1.0), (position.y + 1.0) * 0.25);
	color += (vec3(0.95, 0.65, 0.30) * 1.0 / max(distance(vec2(0.0), position), 0.0001) * 0.075);
	color += vec3(0.95, 0.45, 0.30) * min(1.0, blade *0.7) * (1.0 / max(distance(vec2(0.0, 0.0), position), 0.0001)*0.075);
	return color;

}

void main(void) {

	vec2 uv = 2.0* gl_FragCoord.xy/u_resolution.xy - 1.0;
	uv.x *= u_resolution.x/u_resolution.y;
	
	uv /= 2.0;
	
	float r = length(uv);
	float a = atan(uv.y, uv.x);
	
	a += sin(floor(u_time*10.0)/.5);
	
	uv.x = r*cos(a);
	uv.y = r*sin(a);
	
	gl_FragColor = vec4(star(uv), 1.0);
	

}
`,
  "explosive": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Posted by Trisomie21

float nrand(vec2 n)
{
	return fract(sin(dot(n.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// Процедурная генерация вместо texture2D(backbuffer, ...)
float procBackbuffer(vec2 uv) {
    vec2 p = uv * 10.0;
    float d = length(fract(p) - 0.5);
    float m = smoothstep(0.3, 0.0, d);
    float c = 0.5 + 0.5 * sin(p.x * 3.14159 + u_time * 0.5);
    c += 0.3 + 0.3 * sin(p.y * 2.0 + u_time * 0.7);
    return c * m;
}

void main() {

	vec2 screen_pos = gl_FragCoord.xy;
	vec2 mouse_pos = u_resolution.xy*.5;
	
	vec2 n = screen_pos - mouse_pos;
	float color = nrand(screen_pos*0.01 + u_time*0.01);
	
	if (length(n) > 4.0)
	{
		vec2 y = normalize(-n);
		vec2 x = vec2(-y.y, y.x);
		
		float d = length(n);
		float r = color*d*.25;
	
		// Заменяем texture2D(backbuffer, ...) на процедурную генерацию
		vec2 uv1 = (screen_pos + y*r*.2)/u_resolution.xy;
		vec2 uv2 = (screen_pos + y*r*.8 - x*r*.9)/u_resolution.xy;
		color = procBackbuffer(uv1)*.5 + procBackbuffer(uv2)*.5;
	}
	gl_FragColor = vec4(color-.2, color - .5, color, 1.0 );
}
`,
  "blobs": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// By @paulofalcao
//
// Blobs

float makePoint(float x,float y,float fx,float fy,float sx,float sy,float t){
   float xx=x+sin(t*fx)*sx;
   float yy=y+cos(t*fy)*sy;
   return 1.0/max(sqrt(xx*xx+yy*yy), 0.0001);
}

void main() {

   vec2 p=(gl_FragCoord.xy/u_resolution.x)*2.0-vec2(1.0,u_resolution.y/u_resolution.x);

   p=p*2.0;
   
   float x=p.x;
   float y=p.y;

   float a=
       makePoint(x,y,3.3,2.9,0.3,0.3,u_time);
   a=a+makePoint(x,y,1.9,2.0,0.4,0.4,u_time);
   a=a+makePoint(x,y,0.8,0.7,0.4,0.5,u_time);
   a=a+makePoint(x,y,2.3,0.1,0.6,0.3,u_time);
   a=a+makePoint(x,y,0.8,1.7,0.5,0.4,u_time);
   a=a+makePoint(x,y,0.3,1.0,0.4,0.4,u_time);
   a=a+makePoint(x,y,1.4,1.7,0.4,0.5,u_time);
   a=a+makePoint(x,y,1.3,2.1,0.6,0.3,u_time);
   a=a+makePoint(x,y,1.8,1.7,0.5,0.4,u_time);   
   
   float b=
       makePoint(x,y,1.2,1.9,0.3,0.3,u_time);
   b=b+makePoint(x,y,0.7,2.7,0.4,0.4,u_time);
   b=b+makePoint(x,y,1.4,0.6,0.4,0.5,u_time);
   b=b+makePoint(x,y,2.6,0.4,0.6,0.3,u_time);
   b=b+makePoint(x,y,0.7,1.4,0.5,0.4,u_time);
   b=b+makePoint(x,y,0.7,1.7,0.4,0.4,u_time);
   b=b+makePoint(x,y,0.8,0.5,0.4,0.5,u_time);
   b=b+makePoint(x,y,1.4,0.9,0.6,0.3,u_time);
   b=b+makePoint(x,y,0.7,1.3,0.5,0.4,u_time);

   float c=
       makePoint(x,y,3.7,0.3,0.3,0.3,u_time);
   c=c+makePoint(x,y,1.9,1.3,0.4,0.4,u_time);
   c=c+makePoint(x,y,0.8,0.9,0.4,0.5,u_time);
   c=c+makePoint(x,y,1.2,1.7,0.6,0.3,u_time);
   c=c+makePoint(x,y,0.3,0.6,0.5,0.4,u_time);
   c=c+makePoint(x,y,0.3,0.3,0.4,0.4,u_time);
   c=c+makePoint(x,y,1.4,0.8,0.4,0.5,u_time);
   c=c+makePoint(x,y,0.2,0.6,0.6,0.3,u_time);
   c=c+makePoint(x,y,1.3,0.5,0.5,0.4,u_time);
   
   vec3 d=vec3(a,b,c)/32.0;
   
   gl_FragColor = vec4(d.x,d.y,d.z,1.0);

}
`,
  "spiral-waves": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main()
{

	vec2 position = -1.0 + 2.0 * (gl_FragCoord.xy / u_resolution.xy);
	position.x *= u_resolution.x / u_resolution.y;
	
	position += vec2(cos(u_time * 0.25), sin(u_time * 0.5)) * 0.8;

	vec3 colour = vec3(0.0);
	
	float u = sqrt(dot(position, position));
	float v = atan(position.y, position.x);
	
	float t = u_time + 1.0 / max(u, 0.0001);
	
	float val = smoothstep(0.0, 1.0, sin(5.0 * (u_time + sin(1.0/max(u, 0.0001) * 7.0)) + 10.0 * v) + cos(t * 10.0));
	
	colour = vec3(val * 0.8, val, 0.0) + (1.0 - val) * vec3(0.05, 0.05, 0.05);
	colour *= clamp(u * 1.0, 0.0, 1.0);
	
	gl_FragColor = vec4(colour, 1.0);

}
`,
  "sinus": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

//SINUS by Green120

void main() {

	vec2 p = ( gl_FragCoord.xy / u_resolution.xy ) -0.5;
	
	float sx =0.2*(p.x+0.5)*sin(20.0*p.x-2.*u_time); 
	float dy =1./max(1000.*abs(p.y-sx), 0.0001);
	
	float red =.0;
	
	float blue =dy*5.;
	float green =blue/.3;
	
	float px = .0;
	
	if (p.x<.0){	
	px =p.x*(-1.);
	}
	
	if (p.x>.0){
	blue +=sin(p.x/2.);
	green += p.x/12.;
	}
	
	if (blue< .01){
		blue -=0.4; //GLOW EFFEKT #1
	}
	if (blue> .01){
		blue -=0.4; //GLOW EFFEKT #2
	}
	
	gl_FragColor = vec4( vec3( red, green ,blue) ,1.0 );
	
}
`,
  "lame-tunnel": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

/* lame-ass tunnel by kusma */

void main() {
	vec2 position = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.yy;
	float th = atan(position.y, position.x) / (2.0 * 3.1415926) + 0.5 + u_mouse.x;
	float dd = length(position);
	float d = 0.25 / max(dd, 0.0001) + u_time + u_mouse.y;

	vec3 uv = vec3(th + d, th - d, th + sin(d) * 0.1);
	float a = 0.5 + cos(uv.x * 3.1415926 * 2.0) * 0.5;
	float b = 0.5 + cos(uv.y * 3.1415926 * 2.0) * 0.5;
	float c = 0.5 + cos(uv.z * 3.1415926 * 6.0) * 0.5;
	vec3 color = mix(vec3(1.0, 0.8, 0.9), vec3(0.1, 0.1, 0.2), pow(a, 0.2)) * 3.;
	color += mix(vec3(0.8, 0.9, 1.0), vec3(0.1, 0.1, 0.2),  pow(b, 0.1)) * 0.75;
	color += mix(vec3(0.9, 0.8, 1.0), vec3(0.1, 0.2, 0.2),  pow(c, 0.1)) * 0.75;
	gl_FragColor = vec4(color * clamp(dd, 0.0, 1.0), 1.0);
}
`,
  "wave-lines": `
#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
	vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.7) / max(u_resolution.x, u_resolution.y) * 3.0;
	uv *= 1.0;
	
	float e = 0.0;
	for (float i=3.0;i<=15.0;i+=1.0) {
		e += 0.007/max(abs( (i/15.) +sin((u_time/2.0) + 0.15*i*(uv.x) *( cos(i/4.0 + (u_time / 2.0) + uv.x*2.2) ) ) + 2.5*uv.y), 0.0001);
	}
	
	gl_FragColor = vec4( vec3(e/1.6, e/1.6, e/1.6), 1.0);	
}
`,
  "raster-lines": `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

float WEIGHT = 20.0 / u_resolution.x;

// rasterize functions
float line(vec2 p, vec2 p0, vec2 p1, float w) {
    vec2 d = p1 - p0;
    float t = clamp(dot(d,p-p0) / dot(d,d), 0.0,1.0);
    vec2 proj = p0 + d * t;
    float dist = length(p - proj);
    dist = 1.0/dist*WEIGHT*w;
    return min(dist*dist,1.0);
}

vec3 hsv(float h, float s, float v) {
    vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
    return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
}

void main(void) {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    float line_width = 0.4;
    float t = u_time * 0.31415+sin(length(uv)+u_time*.2)/max(length(uv), 0.0001)*0.1;
    vec3 c = vec3(0.0); //init to fix screenful of random garbage

    for ( float i = 8.0; i < 24.0; i += 2.0 ) {
        float f = line(uv, vec2(cos(t*float(i))/2.0, sin(t*float(i))/2.0), vec2(sin(t*float(i))/2.0,-cos(t*float(i))/2.0), 0.5);
	c += hsv(i / 24.0, 1.0, 1.0) * f;
    }        
    gl_FragColor = vec4(c,1.0);
}
`,
  "rotating-rings": `
#extension GL_OES_standard_derivatives : enable

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define PI 3.1415926535

mat2 rotate3d(float angle)
{
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main()
{
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    p = rotate3d((u_time * 2.0) * PI) * p;
    float t;
    if (sin(u_time) == 10.0)
        t = 0.075 / max(abs(1.0 - length(p)), 0.0001);
    else
        t = 0.075 / max(abs(0.4 - length(p)), 0.0001);
    gl_FragColor = vec4(     ( 1. -exp( -vec3(t)  * vec3(0.13*(sin(u_time)+12.0), p.y*0.7, 3.0) )) , 1.0);
}
`,
  "wave-distortion": `
#extension GL_OES_standard_derivatives : enable

precision mediump float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main( void ) {

	vec2 pos = 4.0 * (gl_FragCoord.xy / u_resolution.xy);

	
	for(int n=1; n < 7; n++){
		float i = float(n);
		
		pos += vec2(
			0.4 / i * sin(i * pos.y * i + u_time / 10.0 + 0.9 * i) + 0.8,
			0.4 / i * sin(i * pos.x * i + u_time / 10.0 + 0.9 * i) + 1.6
		);	
	}
	
	
	float r = 0.5 * sin(pos.x) + 0.5;
	gl_FragColor = vec4(r, 0, 0, 1);

}
`,
  "particle-explosions": `
#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define NUM_EXPLOSIONS 6.0
#define NUM_PARTICLES 1000.0


vec2 Hash12(float t) {
  float x = fract(sin(t * 456.51) * 195.23);
  float y = fract(sin((t + x) * 951.2) * 462.1);
  return vec2(x, y);
}

vec2 Hash12_Polar(float t) {
  float a = fract(sin(t * 456.51) * 195.23) * 6.2832;
  float r = fract(sin((t + a) * 951.2) * 462.1);
  return vec2(sin(a), cos(a)) * r;

}

float Explosion(vec2 uv, float t) {
    float sparks = 0.0;
    for (float i=0.0; i < NUM_PARTICLES; i+=1.0) {
        vec2 dir = Hash12_Polar(i + 1.0) * 0.5;
        float d = length(uv - dir * t);

        float brightness = mix(0.0003, 0.001, smoothstep(0.05, 0.0, t));
        brightness *= sin(t * 20.0 + i) * 0.5 + 0.5;
        brightness *= smoothstep(1.0, 0.7, t);
        sparks += brightness / max(d, 0.0001);
    }
    return sparks;
}

void main(  )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / max(u_resolution.y, 1.0);

    vec3 col = vec3(0.0);


    for ( float i = 0.0; i < NUM_EXPLOSIONS; i+=1.0) {
        float t = (u_time / 1.5) + (i * 123.4) / NUM_EXPLOSIONS;
        float ft = floor(t);
        vec3 colour = sin(4.0 * vec3(0.34, 0.54, 0.43) * ft);
        
        vec2 offset = Hash12(i + 1.0 + ft * NUM_EXPLOSIONS) - 0.5;
        offset *= vec2(0.9, 0.9);
        col += Explosion(uv - offset, fract(t)) * colour;
    }
    
    col /= 2.0;
    
    // Output to screen
    gl_FragColor = vec4(col,1.0);
}
`,
  "particle-explosions-2": `
#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define NUM_EXPLOSIONS 6.0
#define NUM_PARTICLES 100.0


vec2 Hash12(float t) {
  float x = fract(sin(t * 456.51) * 195.23);
  float y = fract(sin((t + x) * 951.2) * 462.1);
  return vec2(x, y);
}

vec2 Hash12_Polar(float t) {
  float a = fract(sin(t * 456.51) * 195.23) * 6.2832;
  float r = fract(sin((t + a) * 951.2) * 462.1);
  return vec2(sin(a), cos(a)) * r;

}

float Explosion(vec2 uv, float t) {
    float sparks = 0.0;
    for (float i=0.0; i < NUM_PARTICLES; i+=1.0) {
        vec2 dir = Hash12_Polar(i + 1.0) * 0.5;
        float d = length(uv - dir * t);

        float brightness = mix(0.0003, 0.001, smoothstep(0.05, 0.0, t));
        brightness *= sin(t * 20.0 + i) * 0.5 + 0.5;
        brightness *= smoothstep(1.0, 0.7, t);
        sparks += brightness / max(d, 0.0001);
    }
    return sparks;
}

void main(  )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / max(u_resolution.y, 1.0);

    vec3 col = vec3(0.0);


    for ( float i = 0.0; i < NUM_EXPLOSIONS; i+=1.0) {
        float t = (u_time / 1.5) + (i * 123.4) / NUM_EXPLOSIONS;
        float ft = floor(t);
        vec3 colour = sin(4.0 * vec3(0.34, 0.54, 0.43) * ft);
        
        vec2 offset = Hash12(i + 1.0 + ft * NUM_EXPLOSIONS) - 0.5;
        offset *= vec2(0.9, 0.9);
        col += Explosion(uv - offset, fract(t)) * colour;
    }
    
    col /= 2.0;
    
    // Output to screen
    gl_FragColor = vec4(col,1.0);
}
`,
  "burisaba-circle": `
/*
 * Original shader from: https://www.shadertoy.com/view/wd23zz
 */

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define M_PI 3.1415926535897932384626433832795
#define M_PI05 (M_PI * 0.5)

vec2 rotate(vec2 v, float c, float s){
	return vec2(v.x*c - v.y*s, v.x*s + v.y*c);
}

vec2 rotate(vec2 v, float r){
	return rotate(v, cos(r), sin(r));
}

float boxLength(vec2 pos) {
	vec2 q = abs(pos);
	return max(q.x, q.y);
}

float capsuleLength(vec2 pos, vec2 dir) {
	vec2 ba = -dir;
	vec2 pa = pos + ba;
	ba *= 2.0;
	float baDot = dot(ba, ba);
	return length(pa - ba * clamp(dot(pa, ba) / max(baDot, 0.0001), 0.0, 1.0));
} 

float triangleLength(vec2 p) {
    p.y += 0.32;
	return max(abs(p.x * 1.8) + p.y, 1.0 - p.y * 1.8) * 0.75;
}

vec2 fracOrigin(vec2 v){
	return (fract(v) - 0.5) * 2.0;
}

float Bu(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.0, -0.5), vec2(1.0, 0.0));   
 	float b = capsuleLength(pos + vec2(-0.3, 0.3), vec2(1.0, 1.0) * 0.707);  
    float c = length(pos + vec2(-1.3, -1.3));
    float d = length(pos + vec2(-1.8, -1.3));
    return min(min(min(a, b), c), d);
}

float Ri(vec2 pos){
 	float a = capsuleLength(pos + vec2(-0.5, 0.0), vec2(0.0, 1.0));   
 	float b = capsuleLength(pos + vec2(0.0, 0.0), vec2(0.1, -0.8) * 0.4);    
    return min(a, b);
}

float To(vec2 pos){ 	
    float a = capsuleLength(pos + vec2(0.0, -0.7), vec2(0.5, 0.0));   
 	float b = capsuleLength(pos + vec2(-0.3, -0.3), vec2(0.3, 1.3));  
    float c = capsuleLength(pos + vec2(0.3, -0.5), vec2(0, 0.5)); 
    return min(min(a, b), c);
}

float Ba(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.8, 0.0), vec2(0.3, 1.0));   
 	float b = capsuleLength(pos + vec2(-0.8, 0.0), vec2(-0.3, 1.0));     
    float c = length(pos + vec2(-1.3, -1.3));
    float d = length(pos + vec2(-1.8, -1.3));
    return min(min(min(a, b), c), d);
}

float Burisaba(vec2 pos, float power){
    float ret = 0.0
     + power / max(Bu(pos), 0.0001)
     + power / max(Ri(pos + vec2(-3.0, 0.0)), 0.0001)
     + power / max(To(pos + vec2(-6.0, 0.0)), 0.0001)
     + power / max(Ba(pos + vec2(-9.0, 0.0)), 0.0001)
        ;
    
    return ret;
}

float smoothstepLine(float lower, float upper, float value, float width){
    width *= 0.5;
    return smoothstep(lower - width, lower, value) * (1.0 - smoothstep(upper, upper + width, value));
}

float smoothLine(float value, float target, float width){
    return width / max(abs(value - target), 0.0001);
}

vec2 smoothLine2(float value, float target, float width){
    return vec2(step(0.0, value - target), width / max(abs(value - target), 0.0001));
}

float circleTriangle(vec2 pos){
    float circle = length(pos * 0.5);
    float triangle = triangleLength(pos * 0.3);    
    return smoothLine(circle, 1.0, 0.025) + smoothLine(triangle, 1.0, 0.025);
}

vec2 circleTriangle2(vec2 pos){
    float circle2 = length(pos * 0.35);
    vec2 ret = smoothLine2(circle2, 1.0, 0.025);
    ret.y += circleTriangle(pos);
    return ret;
}

float atan2(in float y, in float x)
{
    return x == 0.0 ? sign(y) * M_PI05 : atan(y, x);
}

vec2 polar(vec2 uv) {
	float r = length(uv);
	float s = atan2(uv.y, uv.x) / M_PI;
	return vec2(r, s);
}

float BurisabaCircle(vec2 pos){
    vec2 pp = polar(rotate(pos, -u_time) * 0.75);
    return Burisaba(mod(rotate(pp * vec2(2.0, 32.0), M_PI05), vec2(16.0, 4.0)) - 1.5, 0.05) * smoothstepLine(6.0, 7.5, pp.x, 1.5);
}

float BurisabaCircle2(vec2 pos, float scale, float x, float y, float x2, float y2, float lower, float upper, float r){
    vec2 pp = polar(rotate(pos, r) * scale);
    return Burisaba(mod(rotate(pp * vec2(x, y), M_PI05), vec2(x2, y2)) - 1.5, 0.03) * smoothstepLine(lower, upper, pp.x, 0.2);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord.xy - u_resolution.xy * 0.5) / max(u_resolution.y, 1.0) * 20.0;     
      
    uv *= clamp(u_time * 0.25, 0.0, 1.0);
    
    vec3 col = vec3(0.0, 0.0, 0.0);
        
    uv = rotate(uv, u_time * 0.3);
    
    vec2 c2 = circleTriangle2(uv * 1.4 + vec2(0.0, 8.0));
    vec2 c3 = circleTriangle2(uv * 1.4 + rotate(vec2(0.0, 8.0), M_PI * 2.0 * 0.3333));
    vec2 c4 = circleTriangle2(uv * 1.4 + rotate(vec2(0.0, 8.0), M_PI * 2.0 * 0.6666));
    
    float mask = c2.x * c3.x * c4.x;
    
    float len = length(uv);
    
    col.r = BurisabaCircle(uv)
  		
        + (BurisabaCircle2(uv, 0.995, 8.0, 64.0, 12.0, 4.0, 7.5, 8.0, 5.0 + u_time * 0.2)
        + smoothLine(len, 8.0, 0.02)
        + smoothLine(len, 7.5, 0.02)
        
        + BurisabaCircle2(uv, 1.1, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 5.0 + u_time * 0.7)
        + BurisabaCircle2(uv, 1.2, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 15.0 + u_time * 0.1564)
        
        + BurisabaCircle2(uv, 1.45, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 15.0 + u_time * 0.2418654)
        + smoothLine(len, 5.0, 0.02)
        + smoothLine(len, 5.5, 0.02)
        
        + BurisabaCircle2(uv, 2.15, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 35.0 + u_time * 0.34685)
        + BurisabaCircle2(uv, 2.25, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 135.0 + u_time * 0.114)
        + BurisabaCircle2(uv, 1.8, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 532.0 + u_time * 0.54158)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.0 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.25 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.5 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.75 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.1 / max(abs(boxLength(uv * vec2(8.0, 0.5) - vec2(0.0, 2.9)) - 1.0), 0.0001)
        + 0.1 / max(abs(boxLength(rotate(uv, M_PI * 2.0 * 0.3333) * vec2(8.0, 0.5) - vec2(0.0, 2.9)) - 1.0), 0.0001)
        + 0.1 / max(abs(boxLength(rotate(uv, M_PI * 2.0 * 0.6666) * vec2(8.0, 0.5) - vec2(0.0, 2.9)) - 1.0), 0.0001)
           
          ) * mask
      
        + circleTriangle(uv) 
        + c2.y
    	+ c3.y
     	+ c4.y
        ;
   
    fragColor = vec4(col, 1.0);
}

void main(void)
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`,
  "butitoba-circle": `
/*
 * Original shader from: https://www.shadertoy.com/view/wd23zz
 */

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define M_PI 3.1415926535897932384626433832795
#define M_PI05 (M_PI * 0.5)

vec2 rotate(vec2 v, float c, float s){
	return vec2(v.x*c - v.y*s, v.x*s + v.y*c);
}

vec2 rotate(vec2 v, float r){
	return rotate(v, cos(r), sin(r));
}

float boxLength(vec2 pos) {
	vec2 q = abs(pos);
	return max(q.x, q.y);
}

float capsuleLength(vec2 pos, vec2 dir) {
	vec2 ba = -dir;
	vec2 pa = pos + ba;
	ba *= 2.0;
	float baDot = dot(ba, ba);
	return length(pa - ba * clamp(dot(pa, ba) / max(baDot, 0.0001), 0.0, 1.0));
} 

float triangleLength(vec2 p) {
    p.y += 0.32;
	return max(abs(p.x * 1.8) + p.y, 1.0 - p.y * 1.8) * 0.75;
}

vec2 fracOrigin(vec2 v){
	return (fract(v) - 0.5) * 2.0;
}

float Bu(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.0, -0.5), vec2(1.0, 0.0));   
 	float b = capsuleLength(pos + vec2(-0.3, 0.3), vec2(1.0, 1.0) * 0.707);  
    float c = length(pos + vec2(-1.3, -1.3));
    float d = length(pos + vec2(-1.8, -1.3));
    return min(min(min(a, b), c), d);
}

float Chi(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.0, -0.0), vec2(1.0, 0.0));   
 	float b = capsuleLength(pos + vec2(0.0, -1.3), vec2(1.0, 0.8) * 0.4);  
    float c = capsuleLength(pos + vec2(0.0, -0.0), vec2(0.1, 1.0));  
    return min(min(a, b), c);
}

float To(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.5, 0.0), vec2(0.0, 1.0));   
 	float b = capsuleLength(pos + vec2(0.0, 0.0), vec2(1.0, -0.8) * 0.4);    
    return min(a, b);
}

float Ba(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.8, 0.0), vec2(0.3, 1.0));   
 	float b = capsuleLength(pos + vec2(-0.8, 0.0), vec2(-0.3, 1.0));     
    float c = length(pos + vec2(-1.3, -1.3));
    float d = length(pos + vec2(-1.8, -1.3));
    return min(min(min(a, b), c), d);
}

float Butitoba(vec2 pos, float power){
    float ret = 0.0
     + power / max(Bu(pos), 0.0001)
     + power / max(Chi(pos + vec2(-3.0, 0.0)), 0.0001)
     + power / max(To(pos + vec2(-6.0, 0.0)), 0.0001)
     + power / max(Ba(pos + vec2(-9.0, 0.0)), 0.0001)
        ;
    
    return ret;
}

float smoothstepLine(float lower, float upper, float value, float width){
    width *= 0.5;
    return smoothstep(lower - width, lower, value) * (1.0 - smoothstep(upper, upper + width, value));
}

float smoothLine(float value, float target, float width){
    return width / max(abs(value - target), 0.0001);
}

vec2 smoothLine2(float value, float target, float width){
    return vec2(step(0.0, value - target), width / max(abs(value - target), 0.0001));
}

float circleTriangle(vec2 pos){
    float circle = length(pos * 0.5);
    float triangle = triangleLength(pos * 0.3);    
    return smoothLine(circle, 1.0, 0.025) + smoothLine(triangle, 1.0, 0.025);
}

vec2 circleTriangle2(vec2 pos){
    float circle2 = length(pos * 0.35);
    vec2 ret = smoothLine2(circle2, 1.0, 0.025);
    ret.y += circleTriangle(pos);
    return ret;
}

float atan2(in float y, in float x)
{
    return x == 0.0 ? sign(y) * M_PI05 : atan(y, x);
}

vec2 polar(vec2 uv) {
	float r = length(uv);
	float s = atan2(uv.y, uv.x) / M_PI;
	return vec2(r, s);
}

float ButitobaCircle(vec2 pos){
    vec2 pp = polar(rotate(pos, -u_time) * 0.75);
    return Butitoba(mod(rotate(pp * vec2(2.0, 32.0), M_PI05), vec2(16.0, 4.0)) - 1.5, 0.05) * smoothstepLine(6.0, 7.5, pp.x, 1.5);
}

float ButitobaCircle2(vec2 pos, float scale, float x, float y, float x2, float y2, float lower, float upper, float r){
    vec2 pp = polar(rotate(pos, r) * scale);
    return Butitoba(mod(rotate(pp * vec2(x, y), M_PI05), vec2(x2, y2)) - 1.5, 0.03) * smoothstepLine(lower, upper, pp.x, 0.2);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord.xy - u_resolution.xy * 0.5) / max(u_resolution.y, 1.0) * 20.0;     
      
    uv *= clamp(u_time * 0.25, 0.0, 1.0);
    
    vec3 col = vec3(0.0, 0.0, 0.0);
        
    uv = rotate(uv, u_time * 0.3);
    
    vec2 c2 = circleTriangle2(uv * 1.4 + vec2(0.0, 8.0));
    vec2 c3 = circleTriangle2(uv * 1.4 + rotate(vec2(0.0, 8.0), M_PI * 2.0 * 0.3333));
    vec2 c4 = circleTriangle2(uv * 1.4 + rotate(vec2(0.0, 8.0), M_PI * 2.0 * 0.6666));
    
    float mask = c2.x * c3.x * c4.x;
    
    float len = length(uv);
    
    col.g = ButitobaCircle(uv)
  		
        + (ButitobaCircle2(uv, 0.995, 8.0, 64.0, 12.0, 4.0, 7.5, 8.0, 5.0 + u_time * 0.2)
        + smoothLine(len, 10.0+0.25*abs(sin(u_time)), 0.02)
        + smoothLine(len, 7.75+0.25*abs(cos(u_time)), 0.02)
        + smoothLine(len, 2.75+7.75*abs(mod(u_time*0.8, 1.0)), 0.02)
	   
        + ButitobaCircle2(uv, 1.1, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 5.0 + u_time * 0.2)
        + ButitobaCircle2(uv, 1.2, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 15.0 + u_time * 0.1564)
        
        + ButitobaCircle2(uv, 1.45, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 15.0 + u_time * 0.2418654)
        + smoothLine(len, 5.0, 0.02)
        + smoothLine(len, 5.5, 0.02)
        
        + ButitobaCircle2(uv, 2.15, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 35.0 + u_time * 0.34685)
        + ButitobaCircle2(uv, 2.25, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 135.0 + u_time * 0.114)
        + ButitobaCircle2(uv, 1.8, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 532.0 + u_time * 0.54158)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.0 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.25 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.5 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.75 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.1 / max(abs(boxLength(uv * vec2(8.0, 0.5) - vec2(0.0, 2.9)) - 1.0), 0.0001)
        + 0.1 / max(abs(boxLength(rotate(uv, M_PI * 2.0 * 0.3333) * vec2(8.0, 0.5) - vec2(0.0, 2.9)) - 1.0), 0.0001)
        + 0.1 / max(abs(boxLength(rotate(uv, M_PI * 2.0 * 0.6666) * vec2(8.0, 0.5) - vec2(0.0, 2.9)) - 1.0), 0.0001)
           
          ) * mask
      
        + circleTriangle(uv) 
        + c2.y
    	+ c3.y
     	+ c4.y
        ;
   
    fragColor = vec4(col, 1.0);
}

void main(void)
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`,
  "butitoba-circle-2": `
/*
 * Original shader from: https://www.shadertoy.com/view/wd23zz
 */

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define M_PI 3.1415926535897932384626433832795
#define M_PI05 (M_PI * 0.5)

vec2 rotate(vec2 v, float c, float s){
	return vec2(v.x*c - v.y*s, v.x*s + v.y*c);
}

vec2 rotate(vec2 v, float r){
	return rotate(v, cos(r), sin(r));
}

float boxLength(vec2 pos) {
	vec2 q = abs(pos);
	return max(q.x, q.y);
}

float capsuleLength(vec2 pos, vec2 dir) {
	vec2 ba = -dir;
	vec2 pa = pos + ba;
	ba *= 2.0;
	float baDot = dot(ba, ba);
	return length(pa - ba * clamp(dot(pa, ba) / max(baDot, 0.0001), 0.0, 1.0));
} 

float triangleLength(vec2 p) {
    p.y += 0.32;
	return max(abs(p.x * 1.8) + p.y, 1.0 - p.y * 1.8) * 0.75;
}

vec2 fracOrigin(vec2 v){
	return (fract(v) - 0.5) * 2.0;
}

float Bu(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.0, -0.5), vec2(1.0, 0.0));   
 	float b = capsuleLength(pos + vec2(-0.3, 0.3), vec2(1.0, 1.0) * 0.707);  
    float c = length(pos + vec2(-1.3, -1.3));
    float d = length(pos + vec2(-1.8, -1.3));
    return min(min(min(a, b), c), d);
}

float Chi(vec2 pos){
 	float a = capsuleLength(pos + vec2(44.0, -0.0), vec2(1.0, 0.0));   
 	float b = capsuleLength(pos + vec2(0.0, -1.3), vec2(1.0, 0.8) * 0.4);  
    float c = capsuleLength(pos + vec2(0.0, -0.0), vec2(0.1, 1.0));  
    return min(min(a, b), c);
}

float To(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.5, 0.0), vec2(0.0, 1.0));   
 	float b = capsuleLength(pos + vec2(0.0, 0.0), vec2(1.0, -0.8) * 0.4);    
    return min(a, b);
}

float Ba(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.8, 0.0), vec2(0.3, 1.0));   
 	float b = capsuleLength(pos + vec2(-99.8, 0.0), vec2(-88.3, 88.0));     
    float c = length(pos + vec2(-1.3, -1.3));
    float d = length(pos + vec2(-1.8, -1.3));
    return min(min(min(a, b), c), d);
}

float Butitoba(vec2 pos, float power){
    float ret = 0.0
     + power / max(Bu(pos), 0.0001)
     + power / max(Chi(pos + vec2(-3.0, 0.0)), 0.0001)
     + power / max(To(pos + vec2(-6.0, 0.0)), 0.0001)
     + power / max(Ba(pos + vec2(-9.0, 0.0)), 0.0001)
        ;
    
    return ret;
}

float smoothstepLine(float lower, float upper, float value, float width){
    width *= 0.5;
    return smoothstep(lower - width, lower, value) * (1.0 - smoothstep(upper, upper + width, value));
}

float smoothLine(float value, float target, float width){
    return width / max(abs(value - target), 0.0001);
}

vec2 smoothLine2(float value, float target, float width){
    return vec2(step(0.0, value - target), width / max(abs(value - target), 0.0001));
}

float circleTriangle(vec2 pos){
    float circle = length(pos * 0.5);
    float triangle = triangleLength(pos * 0.3);    
    return smoothLine(circle, 1.0, 0.025) + smoothLine(triangle, 1.0, 0.025);
}

vec2 circleTriangle2(vec2 pos){
    float circle2 = length(pos * 0.35);
    vec2 ret = smoothLine2(circle2, 1.0, 0.025);
    ret.y += circleTriangle(pos);
    return ret;
}

float atan2(in float y, in float x)
{
    return x == 0.0 ? sign(y) * M_PI05 : atan(y, x);
}

vec2 polar(vec2 uv) {
	float r = length(uv);
	float s = atan2(uv.y, uv.x) / M_PI;
	return vec2(r, s);
}

float ButitobaCircle(vec2 pos){
    vec2 pp = polar(rotate(pos, -u_time) * 0.75);
    return Butitoba(mod(rotate(pp * vec2(2.0, 32.0), M_PI05), vec2(16.0, 4.0)) - 1.5, 0.05) * smoothstepLine(6.0, 7.5, pp.x, 1.5);
}

float ButitobaCircle2(vec2 pos, float scale, float x, float y, float x2, float y2, float lower, float upper, float r){
    vec2 pp = polar(rotate(pos, r) * scale);
    return Butitoba(mod(rotate(pp * vec2(x, y), M_PI05), vec2(x2, y2)) - 1.5, 0.03) * smoothstepLine(lower, upper, pp.x, 0.2);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord.xy - u_resolution.xy * 0.5) / max(u_resolution.y, 1.0) * 20.0;     
      
    uv *= clamp(u_time * 0.25, 0.0, 1.0);
    
    vec3 col = vec3(0.0, 0.0, 0.0);
        
    uv = rotate(uv, u_time * 0.3);
    
    vec2 c2 = circleTriangle2(uv * 1.4 + vec2(0.0, 8.0));
    vec2 c3 = circleTriangle2(uv * 1.4 + rotate(vec2(0.0, 8.0), M_PI * 2.0 * 0.3333));
    vec2 c4 = circleTriangle2(uv * 1.4 + rotate(vec2(0.0, 8.0), M_PI * 2.0 * 0.6666));
    
    float mask = c2.x * c3.x * c4.x;
    
    float len = length(uv);
    
   col.g = col.b =
	
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.0 + u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.25 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.5 + u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.75 - u_time * 0.5)) - 4.5), 0.0001);
	
    col.g += col.b = ButitobaCircle(uv)
  		
        + (ButitobaCircle2(uv, 0.995, 8.0, 64.0, 332.0, 4.0, 7.5, 8.0, 5.0 + u_time * 0.2)
        + smoothLine(len, 10.0+0.25*abs(sin(u_time)), 0.02)
        + smoothLine(len, 7.75+0.25*abs(cos(u_time)), 0.02)
        + smoothLine(len, 2.75+7.75*abs(mod(u_time*0.8, 1.0)), 0.02)
	   
        + ButitobaCircle2(uv, 88.1, 8.0, 64.0, 177.0, 78.0, 7.5, 7.9, 88.0 - u_time * 77.75)
        + ButitobaCircle2(uv, 1.2, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 15.0 + u_time * 0.275)
        
        + ButitobaCircle2(uv, 44.499, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 15.0 + u_time * 0.2418654)
        + smoothLine(len, 5.0, 0.02)
        + smoothLine(len, 5.5, 0.02)
        
        + ButitobaCircle2(uv, 2.15, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 35.0 + u_time * 0.34685)
        + ButitobaCircle2(uv, 2.25, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 135.0 + u_time * 0.114)
        + ButitobaCircle2(uv, 1.8, 8.0, 64.0, 12.0, 4.0, 99.5, 7.9, 5.0 + u_time * 0.54158)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.0 + u_time * 0.88)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.25 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.5 + u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.75 - u_time * 66.5)) - 4.5), 0.0001)
        + 0.1 / max(abs(boxLength(uv * vec2(8.0, 0.5) - vec2(88.0, 2.9)) - 1.0), 0.0001)
        + 0.1 / max(abs(boxLength(rotate(uv, M_PI * 2.0 * 999.3333) * vec2(8.0, 0.5) - vec2(88.0, 2.9)) - 1.0), 0.0001)
        + 0.1 / max(abs(boxLength(rotate(uv, M_PI * 2.0 * 0.6666) * vec2(8.0, 999.5) - vec2(999.0, 00.9)) - 33.0), 0.0001)
           
          ) * mask
      
        + circleTriangle(uv) 
        + c2.y
    	+ c3.y
     	+ c4.y
        ;
   
    fragColor = vec4(col, 99.0);
}

void main(void)
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`,
  "cobweb": `
// "Cobweb" by Kabuto 
// Based on @ahnqqq's blob raymarcher

// rotwang @mod* colors, @mod+ vignette
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

const vec3 diffuse = vec3( .99, .65, 0.2 );
const vec3 eps = vec3( .001, 0., 0. );
const int iter = 128;
float sq = sqrt(2.0)*0.5;

float c( vec3 p )
{
	vec3 q = abs(mod(p+vec3(cos(p.z*0.5), cos(p.x*11.5), cos(p.y*0.5)),2.0)-1.0);
	float a = q.x + q.y + q.z - min(min(q.x, q.y), q.z) - max(max(q.x, q.y), q.z);
	q = vec3(p.x+p.y, p.y+p.z, p.z+p.x)*sq;
	q = abs(mod(q,2.0)-1.0);
	float b = q.x + q.y + q.z - min(min(q.x, q.y), q.z) - max(max(q.x, q.y), q.z);
	return min(a,b);
}

vec3 n( vec3 p )
{
	float o = c( p );
	return normalize( o - vec3( c( p - eps ), c( p - eps.zxy ), c( p - eps.yzx ) ) );
}

void main()
{
	float aspect = u_resolution.x / max(u_resolution.y, 1.0);
	vec2 p = gl_FragCoord.xy / u_resolution.xy * 2. - 1.;
	vec2 m = u_mouse + vec2(0.5,-0.5);
	p.x *= aspect;
	m.x *= aspect;
	
	vec3 o = vec3( 0., 0., u_time );
	vec3 s = vec3( m, 0. );
	vec3 b = vec3( 0., 0., 0. );
	vec3 d = vec3( p, 1. ) / 32.;
	vec3 t = vec3( .5 );
	vec3 a;
	
	for( int i = 0; i < iter; ++i )
	{
		float h = c( b + s + o );
		b += h * 10.0 * d;
		t += h;
	}
	t /= float( iter );
	a = n( b + s + o );
	float x = dot( a, t );
	t = ( t + pow( x, 4. ) ) * ( 1. - t * .01 ) * diffuse;
	t *= b.z *0.125 ; 
	

	vec2 vig = p*0.43;
	vig.y *= aspect;
	float vig_amount = 1.0- length(vig);
	vec4 color = vec4( t*2.0, 1. )* vig_amount;
	gl_FragColor = color;
}
`,
};

/**
 * Получает код фрагментного шейдера по ID фона
 */
export function getShaderCode(backgroundId) {
  if (!backgroundId) {
    console.warn("getShaderCode: backgroundId is empty");
    return null;
  }
  const code = FRAGMENT_SHADERS[backgroundId];
  if (!code) {
    console.warn(`getShaderCode: shader not found for backgroundId: ${backgroundId}`);
    return null;
  }
  return code;
}

/**
 * Компилирует шейдер
 */
function compileShader(gl, type, source) {
  // Проверяем, что WebGL контекст валиден
  if (!gl) {
    console.error("Shader compilation error: WebGL context is null");
    return null;
  }
  
  // Проверяем, что контекст не потерян
  const isContextLost = gl.isContextLost ? gl.isContextLost() : false;
  if (isContextLost) {
    console.error("Shader compilation error: WebGL context is lost");
    return null;
  }

  if (!source || source.trim() === '') {
    console.error("Shader compilation error: empty shader source");
    return null;
  }

  const shader = gl.createShader(type);
  if (!shader) {
    console.error("Shader compilation error: failed to create shader", {
      type: type === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT",
      contextLost: gl.isContextLost ? gl.isContextLost() : "unknown"
    });
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  // Проверяем статус компиляции
  const compileStatus = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compileStatus) {
    const error = gl.getShaderInfoLog(shader);
    const errorMsg = error || "Unknown shader compilation error";
    console.error("Shader compilation error:", errorMsg, {
      type: type === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT",
      sourceLength: source.length,
      contextLost: gl.isContextLost ? gl.isContextLost() : "unknown",
      canvas: gl.canvas ? { width: gl.canvas.width, height: gl.canvas.height } : 'no canvas'
    });
    gl.deleteShader(shader);
    if (!error) {
      console.error("Shader source:", source.substring(0, 200));
    }
    return null;
  }

  return shader;
}

/**
 * Создает и компилирует шейдер программу
 */
export function compileShaderProgram(gl, fragmentShaderSource) {
  if (!fragmentShaderSource || fragmentShaderSource.trim() === '') {
    console.error("compileShaderProgram: empty fragment shader source");
    return null;
  }

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  if (!vertexShader) {
    console.error("compileShaderProgram: failed to compile vertex shader");
    return null;
  }

  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!fragmentShader) {
    console.error("compileShaderProgram: failed to compile fragment shader");
    gl.deleteShader(vertexShader);
    return null;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program);
    console.error("Program linking error:", error);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

